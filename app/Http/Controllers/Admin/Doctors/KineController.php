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

        // KPIs del día
        $today = Carbon::today();
        $month = Carbon::now()->month;
        $sessionsToday = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->get();

        $sessionsMont = TreatmentSession::where('doctor_id', $doctor->id)
            ->whereDate('date', $month)
            ->get();

        $kpis = [
            'sessions_today' => $sessionsToday->count(),
            'completed_today' => $sessionsToday->where('status', 'Completada')->count(),
            'pending_today' => $sessionsToday->where('status', 'Programada')->count(),
            'today_earnings' => $sessionsToday->sum('doctor_amount_clp'),
            'month_earnings' => $sessionsMont->sum('doctor_amount_clp'),
        ];

        // Agenda del día
        $agenda = TreatmentSession::with(['patient', 'treatment', 'sessionType'])
            ->where('doctor_id', $doctor->id)
            ->whereDate('date', $today)
            ->orderBy('time')
            ->get();

        // Pacientes asignados
        $patientsCount = $doctor->patients()->count();

        return Inertia::render('kine-mobile/dashboard', [
            'doctor' => $doctor,
            'kpis' => $kpis,
            'agenda' => $agenda,
            'patientsCount' => $patientsCount,
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

        return Inertia::render('KineMobile/MyPatients', [
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
        $startDate = $request->input('start_date', Carbon::today()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::today()->endOfMonth());
        $status = $request->input('status');

        $query = TreatmentSession::with(['patient', 'treatment', 'sessionType'])
            ->where('doctor_id', $doctor->id)
            ->whereBetween('date', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }

        $sessions = $query->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

        // Estadísticas
        $stats = [
            'total' => $sessions->count(),
            'completed' => $sessions->where('status', 'Completada')->count(),
            'pending' => $sessions->where('status', 'Programada')->count(),
            'revenue' => $sessions->sum('doctor_amount_clp'),
        ];

        return Inertia::render('KineMobile/MySessions', [
            'doctor' => $doctor,
            'sessions' => $sessions,
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

        $doctor->load(['commissionRates.sessionType', 'branch']);

        // Estadísticas del mes
        $currentMonth = Carbon::now()->startOfMonth();
        $sessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->where('status', 'Completada')
            ->where('date', '>=', $currentMonth)
            ->get();

        $stats = [
            'sessions_month' => $sessions->count(),
            'patients_month' => $sessions->pluck('patient_id')->unique()->count(),
            'revenue_month' => $sessions->sum('patient_amount_clp'),
            'commission_month' => $sessions->sum('doctor_amount_clp'),
        ];

        return Inertia::render('KineMobile/MyProfile', [
            'doctor' => $doctor,
            'stats' => $stats,
        ]);
    }
}
