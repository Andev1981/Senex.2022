<?php

namespace App\Http\Controllers\Kine;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\TreatmentSession;
use App\Models\SessionType;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class KineMobileController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    /**
     * Dashboard principal del kine (optimizado móvil)
     * GET /kine/dashboard
     */
    public function dashboard()
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return $this->accessDenied();
        }

        // Verificar acceso móvil
        if (!$doctor->mobile_access_enabled) {
            return $this->accessDenied('Tu acceso al portal móvil está deshabilitado. Contacta al administrador.');
        }

        // Actualizar última conexión móvil
        $doctor->update(['last_mobile_login' => now()]);
        $doctor->user->update(['last_login_at' => now()]);

        // Estadísticas del día
        $stats = $this->getDailyStats($doctor);

        // Próximas sesiones (hoy y mañana)
        $upcomingSessions = $this->getUpcomingSessions($doctor);

        // Pacientes asignados
        $patientsCount = $doctor->patients()->count();

        return Inertia::render('Kine/Mobile/Dashboard', [
            'doctor' => $this->doctorData($doctor),
            'stats' => $stats,
            'upcomingSessions' => $upcomingSessions,
            'patientsCount' => $patientsCount,
        ]);
    }

    /**
     * Crear nueva sesión (optimizado para móvil)
     * GET /kine/sessions/create
     */
    public function createSession(Request $request)
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return $this->accessDenied();
        }

        // Pacientes asignados al kine
        $patients = $doctor->patients()
            ->select('patients.id', 'patients.name', 'patients.last_name', 'patients.rut')
            ->where('patients.status', 'active')
            ->orderBy('patients.name')
            ->get()
            ->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'name' => trim($patient->name . ' ' . $patient->last_name),
                    'rut' => $patient->rut,
                    'full_name' => trim($patient->name . ' ' . $patient->last_name),
                ];
            });

        // Tipos de sesión disponibles
        $sessionTypes = SessionType::where('is_active', true)
            ->select('id', 'name', 'duration_minutes', 'default_patient_price', 'default_doctor_price')
            ->orderBy('name')
            ->get();

        // Prefill si viene de un paciente específico
        $selectedPatientId = $request->query('patient_id');
        $selectedPatient = null;

        if ($selectedPatientId) {
            $selectedPatient = $patients->firstWhere('id', $selectedPatientId);
        }

        return Inertia::render('Kine/Mobile/CreateSession', [
            'doctor' => $this->doctorData($doctor),
            'patients' => $patients,
            'sessionTypes' => $sessionTypes,
            'selectedPatient' => $selectedPatient,
        ]);
    }

    /**
     * Guardar nueva sesión
     * POST /kine/sessions
     */
    public function storeSession(Request $request)
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'session_type_id' => ['required', 'exists:session_types,id'],
            'treatment_id' => ['nullable', 'exists:treatments,id'],
            'date' => ['required', 'date'],
            'patient_amount' => ['required', 'integer', 'min:0'],
            'doctor_amount' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'session_number' => ['nullable', 'integer', 'min:1'],
        ]);

        try {
            DB::beginTransaction();

            // Verificar que el paciente está asignado a este kine
            $isAssigned = $doctor->patients()->where('patients.id', $validated['patient_id'])->exists();

            if (!$isAssigned) {
                return response()->json([
                    'error' => 'No tienes permiso para crear sesiones de este paciente'
                ], 403);
            }

            // Buscar o crear tratamiento activo
            $treatment = null;
            if ($validated['treatment_id']) {
                $treatment = Treatment::find($validated['treatment_id']);
            } else {
                // Buscar tratamiento activo del paciente
                $treatment = Treatment::where('patient_id', $validated['patient_id'])
                    ->where('status', 'active')
                    ->first();

                // Si no existe, crear uno automático
                if (!$treatment) {
                    $treatment = Treatment::create([
                        'patient_id' => $validated['patient_id'],
                        'doctor_id' => $doctor->id,
                        'name' => 'Tratamiento ' . now()->format('Y-m-d'),
                        'diagnosis' => 'Creado desde portal móvil',
                        'status' => 'active',
                        'start_date' => now(),
                    ]);
                }
            }

            // Crear la sesión
            $session = TreatmentSession::create([
                'treatment_id' => $treatment->id,
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $doctor->id,
                'session_type_id' => $validated['session_type_id'],
                'date' => $validated['date'],
                'session_number' => $validated['session_number'] ?? $this->getNextSessionNumber($treatment->id),
                'patient_amount' => $validated['patient_amount'],
                'doctor_amount' => $validated['doctor_amount'],
                'status' => 'completed', // Sesión ya realizada
                'notes' => $validated['notes'],
            ]);

            // Crear deuda si el paciente no pagó
            if ($validated['patient_amount'] > 0) {
                \App\Models\Debt::create([
                    'patient_id' => $validated['patient_id'],
                    'treatment_session_id' => $session->id,
                    'original_amount' => $validated['patient_amount'],
                    'paid_amount' => 0,
                    'status' => 'pending',
                    'due_date' => now()->addDays(30),
                ]);
            }

            DB::commit();

            Log::info('Sesión creada desde portal móvil', [
                'session_id' => $session->id,
                'doctor_id' => $doctor->id,
                'patient_id' => $validated['patient_id'],
            ]);

            return response()->json([
                'success' => true,
                'message' => '¡Sesión registrada exitosamente!',
                'session' => $session,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creando sesión desde portal móvil', [
                'doctor_id' => $doctor->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'No se pudo registrar la sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mis sesiones (historial)
     * GET /kine/sessions
     */
    public function sessions(Request $request)
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return $this->accessDenied();
        }

        $perPage = $request->query('per_page', 20);
        $dateFrom = $request->query('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->query('date_to', now()->format('Y-m-d'));

        $sessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->with(['patient:id,name,last_name', 'sessionType:id,name'])
            ->orderBy('date', 'desc')
            ->paginate($perPage);

        return Inertia::render('Kine/Mobile/Sessions', [
            'doctor' => $this->doctorData($doctor),
            'sessions' => $sessions,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Resumen de pagos del kine
     * GET /kine/payments
     */
    public function payments(Request $request)
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return $this->accessDenied();
        }

        $month = $request->query('month', now()->format('Y-m'));
        $monthDate = Carbon::parse($month . '-01');

        // Sesiones del mes
        $sessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereYear('date', $monthDate->year)
            ->whereMonth('date', $monthDate->month)
            ->with(['patient:id,name,last_name', 'sessionType:id,name'])
            ->orderBy('date', 'desc')
            ->get();

        // Estadísticas
        $stats = [
            'total_sessions' => $sessions->count(),
            'total_earned' => $sessions->sum('doctor_amount'),
            'total_patient_amount' => $sessions->sum('patient_amount'),
            'average_per_session' => $sessions->count() > 0 
                ? round($sessions->sum('doctor_amount') / $sessions->count()) 
                : 0,
        ];

        // Últimos 6 meses para gráfico
        $last6Months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $monthIterator = now()->subMonths($i);
            $monthEarnings = TreatmentSession::where('doctor_id', $doctor->id)
                ->whereYear('date', $monthIterator->year)
                ->whereMonth('date', $monthIterator->month)
                ->sum('doctor_amount');

            $last6Months->push([
                'month' => $monthIterator->format('M Y'),
                'amount' => $monthEarnings,
            ]);
        }

        return Inertia::render('Kine/Mobile/Payments', [
            'doctor' => $this->doctorData($doctor),
            'sessions' => $sessions,
            'stats' => $stats,
            'chartData' => $last6Months,
            'selectedMonth' => $month,
        ]);
    }

    /**
     * Perfil del kine
     * GET /kine/profile
     */
    public function profile()
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return $this->accessDenied();
        }

        return Inertia::render('Kine/Mobile/Profile', [
            'doctor' => $this->doctorData($doctor, true), // true = incluir datos sensibles
        ]);
    }

    /**
     * Actualizar perfil
     * PUT /kine/profile
     */
    public function updateProfile(Request $request)
    {
        $doctor = $this->getCurrentDoctor();

        if (!$doctor) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'mobile_pin' => ['nullable', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'mobile_preferences' => ['nullable', 'array'],
        ]);

        try {
            $doctor->update([
                'phone' => $validated['phone'] ?? $doctor->phone,
                'email' => $validated['email'] ?? $doctor->email,
                'mobile_pin' => $validated['mobile_pin'] ?? $doctor->mobile_pin,
                'mobile_preferences' => $validated['mobile_preferences'] ?? $doctor->mobile_preferences,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'doctor' => $this->doctorData($doctor, true),
            ]);

        } catch (\Exception $e) {
            Log::error('Error actualizando perfil de kine', [
                'doctor_id' => $doctor->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'No se pudo actualizar el perfil'
            ], 500);
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Obtener el doctor del usuario autenticado
     */
    private function getCurrentDoctor(): ?Doctor
    {
        $user = Auth::user();

        if (!$user) {
            return null;
        }

        return Doctor::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
    }

    /**
     * Estadísticas del día
     */
    private function getDailyStats(Doctor $doctor): array
    {
        $today = now()->format('Y-m-d');

        $todaySessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->count();

        $todayEarnings = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->sum('doctor_amount');

        $monthSessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->count();

        $monthEarnings = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('doctor_amount');

        return [
            'today_sessions' => $todaySessions,
            'today_earnings' => $todayEarnings,
            'month_sessions' => $monthSessions,
            'month_earnings' => $monthEarnings,
        ];
    }

    /**
     * Próximas sesiones programadas
     */
    private function getUpcomingSessions(Doctor $doctor)
    {
        return TreatmentSession::where('doctor_id', $doctor->id)
            ->where('status', 'scheduled')
            ->whereBetween('date', [now()->format('Y-m-d'), now()->addDays(2)->format('Y-m-d')])
            ->with(['patient:id,name,last_name', 'sessionType:id,name'])
            ->orderBy('date')
            ->limit(10)
            ->get();
    }

    /**
     * Obtener siguiente número de sesión
     */
    private function getNextSessionNumber(int $treatmentId): int
    {
        $lastSession = TreatmentSession::where('treatment_id', $treatmentId)
            ->orderBy('session_number', 'desc')
            ->first();

        return $lastSession ? $lastSession->session_number + 1 : 1;
    }

    /**
     * Formatear datos del doctor para el frontend
     */
    private function doctorData(Doctor $doctor, bool $includeSensitive = false): array
    {
        $data = [
            'id' => $doctor->id,
            'name' => $doctor->name,
            'last_name' => $doctor->last_name,
            'full_name' => trim($doctor->name . ' ' . $doctor->last_name),
            'specialty' => $doctor->specialty,
            'status' => $doctor->status,
            'mobile_access_enabled' => $doctor->mobile_access_enabled,
            'last_mobile_login' => $doctor->last_mobile_login,
        ];

        if ($includeSensitive) {
            $data['phone'] = $doctor->phone;
            $data['email'] = $doctor->email ?? $doctor->user->email;
            $data['rut'] = $doctor->rut;
            $data['birth_date'] = $doctor->birth_date;
            $data['mobile_preferences'] = $doctor->mobile_preferences;
            $data['has_mobile_pin'] = !empty($doctor->mobile_pin);
        }

        return $data;
    }

    /**
     * Página de acceso denegado
     */
    private function accessDenied(string $message = null)
    {
        return Inertia::render('Kine/Mobile/AccessDenied', [
            'message' => $message ?? 'No tienes acceso al portal móvil. Contacta al administrador.',
        ]);
    }
}