<?php

namespace App\Http\Controllers\Admin\Reports;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\TreatmentSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index()
    {
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');

        // 1. Ingresos Mensuales (Last 6 Months)
        $revenueData = Payment::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(amount_clp) as total')
        )
        ->where('status', 'completed')
        ->where('company_id', $currentCompanyId)
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // 2. Distribución de Atenciones por Especialidad/Tipo
        $sessionTypeDistribution = TreatmentSession::select(
            'session_types.name',
            DB::raw('count(*) as count')
        )
        ->join('session_types', 'treatment_sessions.session_type_id', '=', 'session_types.id')
        ->where('treatment_sessions.status', TreatmentSession::STATUS_COMPLETED)
        ->where('treatment_sessions.company_id', $currentCompanyId)
        ->groupBy('session_types.name')
        ->get();

        // 3. Resumen General
        $stats = [
            'total_patients' => Patient::where('company_id', $currentCompanyId)->count(),
            'total_revenue_month' => Payment::where('company_id', $currentCompanyId)
                ->whereMonth('created_at', now()->month)
                ->where('status', 'completed')
                ->sum('amount_clp'),
            'completed_sessions_month' => TreatmentSession::where('company_id', $currentCompanyId)
                ->whereMonth('attended_at', now()->month)
                ->where('status', TreatmentSession::STATUS_COMPLETED)
                ->count(),
        ];

        return Inertia::render('Reports/Index', [
            'revenueData' => $revenueData,
            'distributionData' => $sessionTypeDistribution,
            'stats' => $stats
        ]);
    }
}
