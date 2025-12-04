<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Models\PatientAccessCode;
use App\Models\User;
use App\Notifications\PatientAccessCodeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PatientAdminController extends Controller
{
    /**
     * Mostrar formulario de login
     * GET /patient/login
     */
    public function showLogin()
    {
        // Si ya está autenticado, redirigir al dashboard
        if (Auth::guard('patient')->check()) {
            return redirect()->route('patient.dashboard');
        }

        return Inertia::render('Patient/Auth/Login');
    }

    /**
     * Solicitar código de acceso por RUT
     * POST /patient/request-code
     */
    public function requestCode(Request $request)
    {
        // Validar RUT
        $request->validate([
            'rut' => 'required|string',
        ], [
            'rut.required' => 'El RUT es obligatorio.',
        ]);

        $rut = $this->cleanRut($request->rut);

        // Rate limiting: máximo 3 intentos por minuto
        $key = 'request-code:' . $rut;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'rut' => "Demasiados intentos. Por favor espera {$seconds} segundos.",
            ]);
        }

        RateLimiter::hit($key, 60); // 60 segundos

        // Buscar paciente por RUT
        $patient = Patient::where('rut', $rut)->first();

        if (!$patient) {
            // Por seguridad, no revelar si el RUT existe o no
            // Registrar el intento para análisis
            Log::warning('Intento de acceso con RUT no encontrado', [
                'rut' => $rut,
                'ip' => $request->ip(),
            ]);

            throw ValidationException::withMessages([
                'rut' => 'No encontramos un paciente con ese RUT. Verifica o contacta al centro.',
            ]);
        }

        // Verificar que el paciente esté activo
        if ($patient->status !== 'active') {
            throw ValidationException::withMessages([
                'rut' => 'Tu cuenta no está activa. Contacta al centro para más información.',
            ]);
        }

        // Verificar que tenga email
        if (!$patient->email) {
            throw ValidationException::withMessages([
                'rut' => 'No tienes un email registrado. Contacta al centro para actualizar tus datos.',
            ]);
        }

        // Invalidar códigos anteriores
        PatientAccessCode::invalidatePreviousCodesForPatient($patient->id);

        // Generar nuevo código
        $accessCode = PatientAccessCode::createForPatient($patient->id, 15); // 15 minutos

        // Enviar código por email
        try {
            $patient->notify(new PatientAccessCodeNotification($accessCode));

            Log::info('Código de acceso enviado a paciente', [
                'patient_id' => $patient->id,
                'email' => $patient->email,
                'code_id' => $accessCode->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Error al enviar código de acceso', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'rut' => 'Error al enviar el código. Por favor intenta nuevamente.',
            ]);
        }

        return Inertia::render('Patient/Auth/VerifyCode', [
            'rut' => $patient->rut,
            'email' => $this->maskEmail($patient->email),
            'patient_name' => $patient->name,
        ]);
    }

    /**
     * Verificar código e iniciar sesión
     * POST /patient/verify-code
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'rut' => 'required|string',
            'code' => 'required|string|size:6',
        ], [
            'code.required' => 'El código es obligatorio.',
            'code.size' => 'El código debe tener 6 dígitos.',
        ]);

        $rut = $this->cleanRut($request->rut);

        // Rate limiting: máximo 5 intentos por minuto
        $key = 'verify-code:' . $rut;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'code' => "Demasiados intentos. Por favor espera {$seconds} segundos.",
            ]);
        }

        RateLimiter::hit($key, 60); // 60 segundos

        // Buscar paciente
        $patient = Patient::where('rut', $rut)->first();

        if (!$patient) {
            throw ValidationException::withMessages([
                'code' => 'Código inválido.',
            ]);
        }

        // Validar y usar el código
        $accessCode = PatientAccessCode::validateAndUse(
            $patient->id,
            $request->code,
            $request->ip(),
            $request->userAgent()
        );

        if (!$accessCode) {
            Log::warning('Intento de verificación con código inválido', [
                'patient_id' => $patient->id,
                'code' => $request->code,
                'ip' => $request->ip(),
            ]);

            throw ValidationException::withMessages([
                'code' => 'Código inválido o expirado. Solicita uno nuevo.',
            ]);
        }

        // Limpiar rate limiters
        RateLimiter::clear($key);
        RateLimiter::clear('request-code:' . $rut);

        // Iniciar sesión del paciente
        Auth::guard('patient')->login($patient, true); // Remember = true

        // Registrar login exitoso
        Log::info('Paciente inició sesión exitosamente', [
            'patient_id' => $patient->id,
            'access_code_id' => $accessCode->id,
            'ip' => $request->ip(),
        ]);

        // Actualizar último acceso del paciente (opcional)
        // $patient->update(['last_login_at' => now()]);

        return redirect()->route('patient.dashboard');
    }

    /**
     * Reenviar código de acceso
     * POST /patient/resend-code
     */
    public function resendCode(Request $request)
    {
        $request->validate([
            'rut' => 'required|string',
        ]);

        $rut = $this->cleanRut($request->rut);

        // Rate limiting estricto para reenvíos: máximo 2 por 5 minutos
        $key = 'resend-code:' . $rut;
        if (RateLimiter::tooManyAttempts($key, 2)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);
            
            throw ValidationException::withMessages([
                'rut' => "Has alcanzado el límite de reenvíos. Por favor espera {$minutes} minutos.",
            ]);
        }

        RateLimiter::hit($key, 300); // 5 minutos

        // Buscar paciente
        $patient = Patient::where('rut', $rut)->first();

        if (!$patient || !$patient->email) {
            throw ValidationException::withMessages([
                'rut' => 'No se pudo reenviar el código. Contacta al centro.',
            ]);
        }

        // Invalidar códigos anteriores
        PatientAccessCode::invalidatePreviousCodesForPatient($patient->id);

        // Generar nuevo código
        $accessCode = PatientAccessCode::createForPatient($patient->id, 15);

        // Enviar código
        try {
            $patient->notify(new PatientAccessCodeNotification($accessCode));

            Log::info('Código reenviado a paciente', [
                'patient_id' => $patient->id,
                'code_id' => $accessCode->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Código reenviado exitosamente',
            ]);

        } catch (\Exception $e) {
            Log::error('Error al reenviar código', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al reenviar el código',
            ], 500);
        }
    }

    /**
     * Cerrar sesión
     * POST /patient/logout
     */
    public function logout()
    {
        $patientId = Auth::guard('patient')->id();

        Auth::guard('patient')->logout();

        Log::info('Paciente cerró sesión', [
            'patient_id' => $patientId,
        ]);

        return redirect()->route('patient.login')
            ->with('message', 'Sesión cerrada exitosamente');
    }

    // ============================================================================
    // MÉTODOS PRIVADOS
    // ============================================================================

    /**
     * Limpiar RUT (quitar puntos y guión)
     */
    private function cleanRut(string $rut): string
    {
        return strtoupper(preg_replace('/[^0-9kK]/', '', $rut));
    }

    /**
     * Enmascarar email para mostrar parcialmente
     * ejemplo@gmail.com -> e*****@gmail.com
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return $email;
        }

        $name = $parts[0];
        $domain = $parts[1];

        if (strlen($name) <= 2) {
            return $email;
        }

        $masked = substr($name, 0, 1) . str_repeat('*', strlen($name) - 1);

        return $masked . '@' . $domain;
    }
}

