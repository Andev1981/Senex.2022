<?php

namespace App\Http\Controllers;

use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\Commune;
use App\Models\Comuna;
use App\Models\Patient;
use App\Models\SessionType;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if ($user && $user->hasRole('cajero')) {
            return redirect()->route('payments.index');
        }

        if ($user && $user->hasRole('kine')) {
            return redirect()->route('kine.dashboard');
        }

        $activeBranchId = session('active_branch_id');
        $companyId = $user->company_id;
        
        // --- 0. Lógica de Periodo ---
        $period = $request->input('period', 'hoy');
        $startDate = now()->startOfDay();
        $endDate = now()->endOfDay();

        if ($period === 'semana') {
            $startDate = now()->startOfWeek();
            $endDate = now()->endOfWeek();
        } elseif ($period === 'mes') {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        } elseif ($period === 'año') {
            $startDate = now()->startOfYear();
            $endDate = now()->endOfYear();
        }

        $thisMonth = now()->month;
        $thisYear = now()->year;
        $today = now()->toDateString();
        
        // --- 1. DTE / Invoices Stats (Filtrado por periodo) ---
        $invoices = Invoice::where('branch_id', $activeBranchId)
            ->whereBetween('issue_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        $dteDistribution = $invoices->groupBy('dte_type')->map(function ($group, $type) {
            $names = [33 => 'Factura', 34 => 'Fact. Exenta', 39 => 'Boleta', 41 => 'Bol. Exenta', 61 => 'N. Crédito'];
            return [
                'name' => $names[$type] ?? 'Otro',
                'value' => $group->count(),
            ];
        })->values();

        $paymentDistribution = $invoices->groupBy(function($i) {
            return $i->metadata['payment_method'] ?? 'Efectivo';
        })->map(function ($group, $method) {
            return [
                'name' => $method,
                'value' => $group->sum('amount_total_clp'),
            ];
        })->values();

        // --- 2. Pacientes ---
        $pacientesQuery = Patient::where('company_id', $companyId);
        $pacientesTotal = $pacientesQuery->count();
        $pacientesPeriodo = (clone $pacientesQuery)
            ->whereHas('sessions', function($q) use ($activeBranchId, $startDate, $endDate) {
                $q->where('treatment_sessions.branch_id', $activeBranchId)
                  ->whereBetween('treatment_sessions.date', [$startDate->toDateString(), $endDate->toDateString()]);
            })->count();

        // --- 3. Sesiones ---
        $sesionesQuery = \App\Models\TreatmentSession::where('branch_id', $activeBranchId);
        
        // Total para el mes actual (referencia fija)
        $sesionesTotalMes = (clone $sesionesQuery)
            ->whereMonth('date', $thisMonth)
            ->whereYear('date', $thisYear)
            ->count();
            
        // Sesiones en el periodo seleccionado
        $sesionesPeriodo = (clone $sesionesQuery)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->count();

        // --- 4. Ingresos (Sesiones) ---
        $ingresosMes = (clone $sesionesQuery)
            ->whereMonth('date', $thisMonth)
            ->whereYear('date', $thisYear)
            ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
            ->sum('patient_amount_clp');

        $ingresosPeriodo = (clone $sesionesQuery)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
            ->sum('patient_amount_clp');

        // --- 5. Tratamientos Activos ---
        $tratamientosActivos = \App\Models\Treatment::where('branch_id', $activeBranchId)
            ->where('status', \App\Enums\TreatmentStatusEnum::IN_PROGRESS)
            ->count();

        // --- 6. Citas del Periodo (o de Hoy si es corto) ---
        $appointmentsQuery = \App\Models\TreatmentSession::with(['patient', 'item', 'treatment'])
            ->where('branch_id', $activeBranchId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('date')
            ->orderBy('time');
            
        // Si el periodo es muy largo, limitamos a las más cercanas/recientes para no saturar
        if ($period === 'año' || $period === 'mes') {
             $appointmentsQuery->limit(20);
        }

        $todayAppointments = $appointmentsQuery->get()
            ->map(function($session) {
                return [
                    'id' => $session->id,
                    'date' => $session->date->toDateString(),
                    'time' => substr($session->time, 0, 5),
                    'patient' => $session->patient->full_name ?? 'Desconocido',
                    'type' => $session->item->name ?? 'Servicio',
                    'treatment' => $session->treatment->diagnosis ?? 'Sin diagnóstico',
                    'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->label() : $session->status,
                ];
            });

        // --- 7. Pagos Pendientes ---
        $pendingPayments = \App\Models\TreatmentSession::with('patient')
            ->where('branch_id', $activeBranchId)
            ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
            ->whereDoesntHave('invoiceItems')
            ->where('patient_amount_clp', '>', 0)
            ->orderBy('date', 'asc')
            ->limit(5)
            ->get()
            ->map(function($session) {
                return [
                    'id' => $session->id,
                    'patient' => $session->patient->full_name ?? 'Desconocido',
                    'amount_clp' => $session->patient_amount_clp,
                    'dueDate' => clone $session->date,
                    'overdue' => $session->date < now()->startOfDay(),
                ];
            });

        // --- 8. Pacientes Recientes ---
        $recentPatients = Patient::where('company_id', $companyId)
            ->with(['treatments' => function($q) {
                $q->latest()->limit(1);
            }])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($patient) {
                $lastTreatment = $patient->treatments->first();
                $progress = 0;
                if ($lastTreatment && $lastTreatment->total_sessions > 0) {
                    $progress = ($lastTreatment->completed_sessions / $lastTreatment->total_sessions) * 100;
                }

                $nextAppt = $patient->appointments()->where('start_at', '>', now())->orderBy('start_at')->first();
                $lastVisit = $patient->sessions()
                    ->where('treatment_sessions.status', \App\Enums\AppointmentStatusEnum::COMPLETED)
                    ->orderBy('treatment_sessions.date', 'desc')
                    ->first();

                return [
                    'id' => $patient->id,
                    'name' => $patient->full_name,
                    'lastVisit' => $lastVisit ? $lastVisit->date->toDateString() : '-',
                    'nextAppointment' => $nextAppt ? $nextAppt->start_at->toDateString() : null,
                    'status' => $lastTreatment && $lastTreatment->status === \App\Enums\TreatmentStatusEnum::IN_PROGRESS ? 'Activo' : 'Inactivo',
                    'progress' => min(100, max(0, $progress)),
                ];
            });

        $stats = [
            'period' => $period,
            'total_facturado' => $invoices->sum('amount_total_clp'),
            'count_dtes' => $invoices->count(),
            'count_accepted' => $invoices->where('dte_status', 'accepted')->count(),
            'dte_distribution' => $dteDistribution,
            'payment_distribution' => $paymentDistribution,
            
            // Datos filtrados por periodo
            'pacientesTotal' => $pacientesTotal,
            'pacientesHoy' => $pacientesPeriodo,
            'sesionesTotal' => $sesionesTotalMes,
            'sesionesHoy' => $sesionesPeriodo,
            'ingresosMes' => $ingresosMes,
            'ingresosHoy' => $ingresosPeriodo,
            'tratamientosActivos' => $tratamientosActivos,
            'todayAppointments' => $todayAppointments,
            'pendingPayments' => $pendingPayments,
            'recentPatients' => $recentPatients,
        ];

        return Inertia::render('dashboard', [
            'dte_stats' => $stats
        ]);
    }
}
