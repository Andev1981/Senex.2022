<?php
// app/Http/Controllers/KineMobile/DashboardMobileController.php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardMobileController extends Controller
{
    /**
     * Dashboard principal del kinesiólogo con Agenda Calendario integrada
     */
    public function index(): Response
    {
        $doctor = Auth::user()->doctor;
        $today = Carbon::today();

        $companyId = session('current_company_id') ?: Auth::user()->company_id;
        $activeBranchId = session('active_branch_id');

        // --- KPI CALCULATIONS ---
        // Función para mapear TreatmentSession (Registro Clínico)
        $mapSession = function($session) use ($today) {
            $date = $session->date;
            $dateHuman = $date->isToday() ? 'Hoy' : ($date->isTomorrow() ? 'Mañana' : 'Próximo ' . $date->dayName);
            $fullDateLabel = "{$dateHuman} (" . $date->format('d/m') . ")";

            return [
                'id' => $session->id,
                'is_appointment' => false,
                'date' => $date->format('d/m/Y'),
                'date_human' => $fullDateLabel,
                'time' => $session->time?->format('H:i'),
                'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->value : $session->status,
                'patient_name' => $session->patient?->full_name ?? 'S/N',
                'patient_id' => $session->patient_id,
                'patient_phone' => $session->patient?->phone,
                'has_active_treatments' => $session->patient?->activeTreatments->count() > 0,
                'active_treatments' => $session->patient?->activeTreatments->map(fn($t) => [
                    'id' => $t->id,
                    'description' => $t->diagnostic?->description ?? $t->referral_diagnosis ?? 'Kinesiología',
                ]),
                'session_type' => $session->item?->name ?? 'Servicio',
                'diagnosis' => $session->treatment?->referral_diagnosis ?? 'Sin diagnóstico',
                'earnings' => (int)($session->doctor_amount_clp ?? 0),
            ];
        };

        $sessionsToday = TreatmentSession::with(['patient.activeTreatments.diagnostic', 'treatment', 'item'])
            ->where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->get();

        $doctorBranch = $doctor->getBranchAttribute();
        $canViewAll = (bool)($doctorBranch['can_view_sessions'] ?? true);

        // 3. Fichas Pendientes de Cierre de HOY (Iniciadas hoy pero no completadas)
        $pendingQuery = TreatmentSession::with(['patient.activeTreatments.diagnostic', 'item'])
            ->whereDate('date', $today)
            ->whereIn('status', [\App\Enums\AppointmentStatusEnum::IN_PROGRESS, \App\Enums\AppointmentStatusEnum::CHECKED_IN]);

        if ($canViewAll && $activeBranchId) {
            $pendingQuery->where('branch_id', $activeBranchId);
        } else {
            $pendingQuery->where('doctor_id', $doctor->id);
        }

        $pendingClosure = $pendingQuery->orderBy('date', 'desc')
            ->get()
            ->map($mapSession);

        // 4. Próximas Sesiones (Desde mañana en adelante)
        $upcomingCount = \App\Models\Appointment::where('doctor_id', $doctor->id)
            ->where('start_at', '>', $today->endOfDay())
            ->whereIn('status', [\App\Enums\AppointmentStatusEnum::SCHEDULED, \App\Enums\AppointmentStatusEnum::CONFIRMED])
            ->count();

        // Total Hoy (Citas de hoy de este kine)
        $todayAppointmentsCount = \App\Models\Appointment::where('doctor_id', $doctor->id)
            ->whereDate('start_at', $today)
            ->where('status', '!=', \App\Enums\AppointmentStatusEnum::CANCELLED)
            ->count();

        $kpis = [
            'sessions_today' => $todayAppointmentsCount + $sessionsToday->count(),
            'completed_today' => $sessionsToday->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)->count(),
            'pending_today' => \App\Models\Appointment::where('doctor_id', $doctor->id)->whereDate('start_at', $today)->whereIn('status', [\App\Enums\AppointmentStatusEnum::SCHEDULED, \App\Enums\AppointmentStatusEnum::CONFIRMED])->count(),
            'pending_closure_count' => $pendingClosure->count(),
            'upcoming_sessions_count' => $upcomingCount,
        ];

        // --- CALENDAR DATA ---
        // Obtener citas activas de la sucursal actual para verificar disponibilidad/cargas
        $appointments = \App\Models\Appointment::where('company_id', $companyId)
            ->where('branch_id', $activeBranchId)
            ->where('status', '!=', \App\Enums\AppointmentStatusEnum::CANCELLED)
            ->with(['patient', 'doctor', 'item.serviceDetail', 'room', 'treatmentSession'])
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'date' => $apt->start_at->format('Y-m-d'),
                    'start_time' => $apt->start_at->format('H:i'),
                    'end_time' => $apt->end_at->format('H:i'),
                    'patient_id' => $apt->patient_id,
                    'doctor_id' => $apt->doctor_id,
                    'room_id' => $apt->room_id,
                    'patient' => $apt->patient,
                    'doctor' => $apt->doctor,
                    'item' => $apt->item,
                    'room' => $apt->room,
                    'modality' => $apt->modality?->value ?? 'onsite',
                    'status' => $apt->status,
                    'notes' => $apt->notes,
                    'treatment_session_id' => $apt->treatmentSession?->id,
                ];
            });

        // Sesiones manuales sin cita para bloquear disponibilidad real
        $manualSessions = TreatmentSession::where('company_id', $companyId)
            ->where('branch_id', $activeBranchId)
            ->whereNull('appointment_id')
            ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
            ->with(['patient', 'doctor', 'item.serviceDetail', 'room'])
            ->get()
            ->map(function ($sess) {
                return [
                    'id' => "sess_{$sess->id}",
                    'date' => $sess->date->format('Y-m-d'),
                    'start_time' => $sess->time->format('H:i'),
                    'end_time' => $sess->time->copy()->addMinutes(45)->format('H:i'), // Estimación 45m
                    'patient_id' => $sess->patient_id,
                    'doctor_id' => $sess->doctor_id,
                    'room_id' => $sess->room_id,
                    'patient' => $sess->patient,
                    'doctor' => $sess->doctor,
                    'item' => $sess->item,
                    'room' => $sess->room,
                    'status' => $sess->status,
                    'is_manual_session' => true
                ];
            });

        $allAppointments = $appointments->concat($manualSessions);

        return Inertia::render('kine-mobile/dashboard', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name . ' ' . $doctor->last_name,
                'speciality' => $doctor->speciality,
            ],
            'kpis' => $kpis,
            'pendingClosure' => $pendingClosure,
            'activePatientsCount' => $doctor->patients()->count(),
            'appointments' => $allAppointments,
            'currentBranch' => \App\Models\Branch::find($activeBranchId),
            // Solo pasamos a este doctor para pre-selección/bloqueo de agendamiento
            'doctors' => \App\Models\Doctor::where('id', $doctor->id)->get(),
            'patients' => \App\Models\Patient::where('company_id', $companyId)->with(['insurance', 'activeTreatments'])->get(),
            'items' => \App\Models\Item::where('company_id', $companyId)->with('serviceDetail')->get(),
            'agreements' => \App\Models\Agreement::where('company_id', $companyId)
                ->where('is_active', true)
                ->with(['rules' => function($q) {
                    $q->select('id', 'agreement_id', 'item_id', 'plan_id', 'patient_share_clp', 'insurance_share_clp', 'patient_percentage');
                }])
                ->get(['id', 'name', 'insurance_id']),
            'rooms' => \App\Models\Room::where('branch_id', $activeBranchId)->get(),
            'availabilities' => \App\Models\Availability::where('company_id', $companyId)->get(),
            'holidays' => \App\Models\Holiday::where('company_id', $companyId)->get(),
            'exceptions' => \App\Models\AvailabilityException::where('company_id', $companyId)->with('doctor')->get(),
            'regions' => \Illuminate\Support\Facades\Cache::remember('geo_regions', 86400, fn() => \App\Models\Region::all(['id', 'name'])),
            'communes' => \Illuminate\Support\Facades\Cache::remember('geo_communes', 86400, fn() => \App\Models\Commune::all(['id', 'name', 'region_id'])),
        ]);
    }

    /**
     * Listado de la Bitácora de Atenciones (Historial Reciente)
     */
    public function pendingSessions(): Response
    {
        $doctor = Auth::user()->doctor;
        $today = Carbon::today();
        $activeBranchId = session('active_branch_id');

        $doctorBranch = $doctor->getBranchAttribute();
        $canViewAll = (bool)($doctorBranch['can_view_sessions'] ?? true);

        $mapSession = function($session) use ($today) {
            $date = $session->date;
            $dateHuman = $date->isToday() ? 'Hoy' : ($date->isTomorrow() ? 'Mañana' : 'Hace ' . $date->diffForHumans(['parts' => 1]));
            
            return [
                'id' => $session->id,
                'date' => $date->format('d/m/Y'),
                'date_human' => $dateHuman,
                'time' => $session->time?->format('H:i'),
                'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->value : $session->status,
                'patient_name' => $session->patient?->full_name ?? 'S/N',
                'session_type' => $session->item?->name ?? 'Servicio',
                'diagnosis' => $session->treatment?->referral_diagnosis ?? 'Sin diagnóstico',
            ];
        };

        // Historial de atenciones completadas recientes (últimas 30)
        $completedQuery = TreatmentSession::with(['patient', 'treatment', 'item'])
            ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED);

        if ($canViewAll && $activeBranchId) {
            $completedQuery->where('branch_id', $activeBranchId);
        } else {
            $completedQuery->where('doctor_id', $doctor->id);
        }

        $recentSessions = $completedQuery->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->limit(30)
            ->get()
            ->map($mapSession);

        return Inertia::render('kine-mobile/pending-sessions', [
            'recentSessions'  => $recentSessions,
        ]);
    }
}
