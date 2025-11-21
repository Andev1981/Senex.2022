<?php
// app/Http/Controllers/KineMobile/DashboardController.php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard principal del kinesiólogo
     */
    public function index(): Response
    {
        $doctor = Auth::user()->doctor;
        $today = Carbon::today();

        // KPIs del día (cacheados por 5 minutos)
        $kpis = Cache::remember(
            "kine_dashboard_kpis_{$doctor->id}_{$today->format('Y-m-d')}",
            300,
            function () use ($doctor, $today) {
                $sessionsToday = TreatmentSession::where('doctor_id', $doctor->id)
                    ->whereDate('date', $today)
                    ->get();

                $sessionsMonth = TreatmentSession::where('doctor_id', $doctor->id)
                    ->whereMonth('date', $today->month)
                    ->whereYear('date', $today->year)
                    ->get();

                return [
                    'sessions_today' => $sessionsToday->count(),
                    'completed_today' => $sessionsToday->where('status', 'Completada')->count(),
                    'pending_today' => $sessionsToday->where('status', 'Programada')->count(),
                    'cancelled_today' => $sessionsToday->where('status', 'Cancelada')->count(),
                    'today_earnings' => $sessionsToday->where('status', 'Completada')->sum('doctor_amount'),
                    'month_sessions' => $sessionsMonth->count(),
                    'month_earnings' => $sessionsMonth->where('status', 'Completada')->sum('doctor_amount'),
                ];
            }
        );

        // Agenda del día (NO cacheada - debe ser en tiempo real)
        $agenda = TreatmentSession::with([
            'patient:id,name,last_name,phone',
            'treatment:id,diagnosis',
            'sessionType:id,name,duration_minutes'
        ])
            ->select('id', 'patient_id', 'treatment_id', 'session_type_id', 
                     'date', 'time', 'status', 'doctor_amount_clp', 'notes')
            ->where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->orderBy('time')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'time' => $session->time,
                    'status' => $session->status,
                    'patient_name' => $session->patient->name . ' ' . $session->patient->last_name,
                    'patient_phone' => $session->patient->phone,
                    'session_type' => $session->sessionType->name,
                    'duration' => $session->sessionType->duration_minutes,
                    'diagnosis' => $session->treatment->diagnosis ?? 'Sin diagnóstico',
                    'earnings' => $session->doctor_amount,
                ];
            });

        // Próximas sesiones (siguiente semana)
        $upcomingSessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->where('status', 'Programada')
            ->whereBetween('date', [$today->addDay(), $today->copy()->addWeek()])
            ->count();

        // Total pacientes activos
        $activePatientsCount = $doctor->patients()
            ->whereHas('treatments', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                  ->where('status', 'InProgress');
            })
            ->count();

        return Inertia::render('KineMobile/Dashboard', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name . ' ' . $doctor->last_name,
                'specialty' => $doctor->specialty,
            ],
            'kpis' => $kpis,
            'agenda' => $agenda,
            'upcomingSessions' => $upcomingSessions,
            'activePatientsCount' => $activePatientsCount,
        ]);
    }

    /**
     * Refrescar KPIs (para pull-to-refresh)
     */
    public function refreshKpis()
    {
        $doctor = Auth::user()->doctor;
        $today = Carbon::today();

        // Limpiar cache
        Cache::forget("kine_dashboard_kpis_{$doctor->id}_{$today->format('Y-m-d')}");

        return response()->json([
            'success' => true,
            'message' => 'KPIs actualizados'
        ]);
    }
}