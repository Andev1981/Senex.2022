<?php

namespace App\Http\Controllers\Admin\Doctors;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KineController extends Controller
{
    /**
     * Dashboard del kinesiólogo
     */
    public function dashboard()
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return redirect()->route('login');
        }

        $today = Carbon::today();
        
        // Función auxiliar para mapear sesiones para el componente móvil
        $mapSession = function($session) {
            return [
                'id' => $session->id,
                'date' => $session->date->format('d/m/Y'),
                'time' => $session->time?->format('H:i'),
                'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->value : $session->status,
                'patient_name' => $session->patient?->full_name ?? 'S/N',
                'patient_phone' => $session->patient?->phone,
                'session_type' => $session->item?->name ?? 'Servicio',
                'diagnosis' => $session->treatment?->referral_diagnosis ?? 'Sin diagnóstico',
                'earnings' => (int)($session->doctor_amount_clp ?? 0),
            ];
        };

        // Agenda de Hoy
        $agenda = TreatmentSession::with(['patient', 'treatment', 'item'])
            ->where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->orderBy('time')
            ->get()
            ->map($mapSession);

        // Próximas sesiones (Mañana en adelante)
        $upcomingSessions = TreatmentSession::with(['patient', 'treatment', 'item'])
            ->where('doctor_id', $doctor->id)
            ->whereDate('date', '>', $today)
            ->whereIn('status', [\App\Enums\AppointmentStatusEnum::SCHEDULED, \App\Enums\AppointmentStatusEnum::CONFIRMED])
            ->orderBy('date')
            ->orderBy('time')
            ->limit(5)
            ->get();

        $kpis = [
            'sessions_today' => $agenda->count(),
            'completed_today' => $agenda->where('status', 'completed')->count(),
            'pending_today' => $agenda->whereIn('status', ['scheduled', 'checked_in'])->count(),
        ];

        return Inertia::render('kine-mobile/dashboard', [
            'doctor' => $doctor,
            'kpis' => $kpis,
            'agenda' => $agenda,
            'upcomingSessions' => $upcomingSessions->map($mapSession),
            'upcomingSessionsCount' => $upcomingSessions->count(),
            'activePatientsCount' => $doctor->patients()->count(),
        ]);
    }

    /**
     * Mis pacientes asignados
     */
    public function myPatients()
    {
        $doctor = Auth::user()->doctor;

        $patients = $doctor->patients()
            ->with(['treatments' => function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                    ->where('status', 'InProgress');
            }])
            ->withCount(['sessions as total_sessions'])
            ->get();

        return Inertia::render('kine-mobile/my-patients', [
            'doctor' => $doctor,
            'patients' => $patients,
        ]);
    }

    /**
     * Mis sesiones
     */
    public function mySessions(Request $request)
    {
        $doctor = Auth::user()->doctor;

        // Filtros
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->addDays(7)->toDateString());
        $status = $request->input('status');

        // 1. Obtener Appointments (Programados)
        $aptQuery = \App\Models\Appointment::with(['patient', 'item'])
            ->where('doctor_id', $doctor->id)
            ->whereBetween('start_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);

        if ($status && $status === 'scheduled') {
            $aptQuery->where('status', \App\Enums\AppointmentStatusEnum::SCHEDULED);
        }

        $appointments = $aptQuery->get()->map(function ($apt) {
            return [
                'id' => $apt->id,
                'is_appointment' => true,
                'date' => $apt->start_at->format('d/m/Y'),
                'time' => $apt->start_at->format('H:i'),
                'status' => $apt->status instanceof \App\Enums\AppointmentStatusEnum ? $apt->status->value : $apt->status,
                'patient_name' => $apt->patient?->full_name ?? 'S/N',
                'patient_phone' => $apt->patient?->phone,
                'session_type' => $apt->item?->name ?? 'Servicio',
                'duration' => 45,
                'diagnosis' => 'Agenda Programada',
                'earnings' => 0,
            ];
        });

        // 2. Obtener TreatmentSessions (Ya iniciadas/procesadas)
        $sessionQuery = TreatmentSession::with(['patient', 'treatment', 'item'])
            ->where('doctor_id', $doctor->id)
            ->whereBetween('date', [$startDate, $endDate]);

        if ($status && $status !== 'scheduled') {
            $sessionQuery->where('status', $status);
        }

        $sessions = $sessionQuery->get()->map(function ($session) {
            return [
                'id' => $session->id,
                'is_appointment' => false,
                'date' => $session->date->format('d/m/Y'),
                'time' => $session->time?->format('H:i'),
                'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->value : $session->status,
                'patient_name' => $session->patient?->full_name ?? 'S/N',
                'patient_phone' => $session->patient?->phone,
                'session_type' => $session->item?->name ?? 'Servicio',
                'duration' => $session->duration,
                'diagnosis' => $session->treatment?->referral_diagnosis ?? 'Sin diagnóstico',
                'earnings' => (int)$session->doctor_amount_clp,
            ];
        });

        // 3. Merge y Orden
        $allSessions = $appointments->concat($sessions)
            ->sortBy([['date', 'asc'], ['time', 'asc']])
            ->values();

        // Estadísticas
        $stats = [
            'total' => $allSessions->count(),
            'completed' => $sessions->where('status', 'completed')->count(),
            'pending' => $allSessions->whereIn('status', ['scheduled', 'checked_in'])->count(),
            'cancelled' => $allSessions->where('status', 'cancelled')->count(),
            'revenue' => $sessions->sum('earnings'),
        ];

        return Inertia::render('kine-mobile/my-sessions', [
            'doctor' => $doctor,
            'sessions' => $allSessions,
            'stats' => $stats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Mi perfil
     */
    public function myProfile()
    {
        $doctor = Auth::user()->doctor;

        $doctor->load(['commissionRates.item', 'branch']);

        // Estadísticas del mes
        $currentMonth = Carbon::now()->startOfMonth();
        $sessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
            ->where('date', '>=', $currentMonth)
            ->get();

        $stats = [
            'sessions_month' => $sessions->count(),
            'patients_month' => $sessions->pluck('patient_id')->unique()->count(),
            'revenue_month' => $sessions->sum('patient_amount_clp'),
            'commission_month' => $sessions->sum('doctor_amount_clp'),
        ];

        return Inertia::render('kine-mobile/my-profile', [
            'doctor' => $doctor,
            'stats' => $stats,
        ]);
    }
}
