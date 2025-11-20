<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetKineEmail;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class DoctorController extends Controller
{
    /**
     * Crear nuevo kinesiólogo (con usuario automático)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'rut' => 'nullable|string|max:20|unique:doctors,rut',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'specialty' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other,unknown',
        ]);

        DB::beginTransaction();
        
        try {
            // 1. GENERAR CONTRASEÑA TEMPORAL
            $temporalPassword = $this->generateTemporalPassword();
            
            // 2. CREAR USUARIO
            $user = User::create([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($temporalPassword),
                'status' => 'active',
                'email_verified_at' => now(), // Auto-verificado
            ]);

            // 3. ASIGNAR ROL 'kine'
            $user->assignRole('kine');

            // 4. CREAR REGISTRO DE DOCTOR
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'rut' => $validated['rut'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'specialty' => $validated['specialty'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'] ?? 'unknown',
                'status' => 'active',
                'mobile_access_enabled' => true, // ✅ Acceso móvil habilitado
            ]);

            // 5. ENVIAR EMAIL CON CREDENCIALES
            try {
                Mail::to($user->email)->send(
                    new \App\Mail\WelcomeKineEmail($user, $temporalPassword)
                );
            } catch (\Exception $e) {
                Log::warning('Error enviando email de bienvenida', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                // No fallar la creación si falla el email
            }

            DB::commit();

            Log::info('Kinesiólogo creado exitosamente', [
                'doctor_id' => $doctor->id,
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return redirect()
                ->route('admin.doctors.index')
                ->with('success', "Kinesiólogo creado. Email enviado a {$user->email} con credenciales.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error creando kinesiólogo', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear kinesiólogo: ' . $e->getMessage()]);
        }
    }

    /**
     * Actualizar kinesiólogo
     */
    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'rut' => 'nullable|string|max:20|unique:doctors,rut,' . $doctor->id,
            'email' => 'required|email|unique:users,email,' . $doctor->user_id,
            'phone' => 'nullable|string|max:50',
            'specialty' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other,unknown',
            'status' => 'required|in:active,suspended,cancelled',
            'mobile_access_enabled' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            // Actualizar doctor
            $doctor->update([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'rut' => $validated['rut'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'specialty' => $validated['specialty'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'] ?? $doctor->gender,
                'status' => $validated['status'],
                'mobile_access_enabled' => $validated['mobile_access_enabled'] ?? $doctor->mobile_access_enabled,
            ]);

            // Actualizar usuario
            $doctor->user->update([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
            ]);

            DB::commit();

            return redirect()
                ->route('admin.doctors.index')
                ->with('success', 'Kinesiólogo actualizado correctamente');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error actualizando kinesiólogo', [
                'doctor_id' => $doctor->id,
                'error' => $e->getMessage()
            ]);
            
            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()]);
        }
    }

    /**
     * Habilitar/Deshabilitar acceso móvil
     */
    public function toggleMobileAccess(Doctor $doctor)
    {
        try {
            $doctor->update([
                'mobile_access_enabled' => !$doctor->mobile_access_enabled
            ]);

            $status = $doctor->mobile_access_enabled ? 'habilitado' : 'deshabilitado';

            return response()->json([
                'success' => true,
                'message' => "Acceso móvil {$status}",
                'mobile_access_enabled' => $doctor->mobile_access_enabled,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar acceso móvil'
            ], 500);
        }
    }

    /**
     * Resetear contraseña de kine
     */
    public function resetPassword(Doctor $doctor)
    {
        DB::beginTransaction();

        try {
            $newPassword = $this->generateTemporalPassword();
            
            $doctor->user->update([
                'password' => Hash::make($newPassword)
            ]);

            // Enviar email con nueva contraseña
            Mail::to($doctor->user->email)->send(
                new PasswordResetKineEmail($doctor->user, $newPassword)
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Contraseña reseteada. Email enviado al kinesiólogo.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error reseteando contraseña', [
                'doctor_id' => $doctor->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al resetear contraseña'
            ], 500);
        }
    }

    /**
     * Generar contraseña temporal segura
     */
    private function generateTemporalPassword(): string
    {
        // Genera una contraseña de 8 caracteres: 
        // - 4 letras mayúsculas
        // - 4 números
        $letters = strtoupper(Str::random(4));
        $numbers = substr(str_shuffle('0123456789'), 0, 4);
        
        return $letters . $numbers;
        // Ejemplo: "ABCD1234"
    }

    /**
     * Eliminar kinesiólogo (soft delete)
     */
    public function destroy(Doctor $doctor)
    {
        try {
            // Soft delete del doctor
            $doctor->delete();

            // También deshabilitar el usuario
            $doctor->user->update(['status' => 'inactive']);

            return redirect()
                ->route('admin.doctors.index')
                ->with('success', 'Kinesiólogo eliminado correctamente');

        } catch (\Exception $e) {
            Log::error('Error eliminando kinesiólogo', [
                'doctor_id' => $doctor->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al eliminar']);
        }
    }
}