<?php

namespace App\Http\Controllers\Admin\Reports;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\TreatmentSession;
use App\Models\Invoice;
use App\Enums\FinanceStatusEnum;
use App\Enums\DteStatusEnum;
use App\Enums\AppointmentStatusEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index()
    {
        $companyId = session('current_company_id', 2);
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

        // 1. Flujo de Caja (Pagos Recibidos - Últimos 6 meses)
        $cashFlowData = Payment::select(
            DB::raw('DATE_FORMAT(paid_at, "%Y-%m") as month'),
            DB::raw('SUM(amount_clp) as total')
        )
        ->where('company_id', $companyId)
        ->where('status', 'completed')
        ->where('paid_at', '>=', $now->copy()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // 2. Cuentas por Cobrar (Invoices pendientes o parciales)
        $receivables = Invoice::where('company_id', $companyId)
            ->whereIn('payment_status', [FinanceStatusEnum::UNPAID, FinanceStatusEnum::PARTIAL])
            ->sum('total_amount_clp');

        // 3. Pendientes de Facturación (Sesiones completadas sin InvoiceItem asociado)
        $pendingToInvoice = TreatmentSession::where('company_id', $companyId)
            ->where('status', AppointmentStatusEnum::COMPLETED)
            ->whereDoesntHave('invoiceItems')
            ->sum('patient_amount_clp');

        // 4. Estado de DTEs (Tributario)
        $dteStats = Invoice::select('dte_status', DB::raw('count(*) as count'))
            ->where('company_id', $companyId)
            ->groupBy('dte_status')
            ->get()
            ->mapWithKeys(fn($item) => [$item->dte_status->value => $item->count]);

        // 5. Resumen General (Mes Actual)
        $stats = [
            'total_patients' => Patient::where('company_id', $companyId)->count(),
            'revenue_month' => Payment::where('company_id', $companyId)
                ->whereBetween('paid_at', [$startOfMonth, $now])
                ->where('status', 'completed')
                ->sum('amount_clp'),
            'invoiced_month' => Invoice::where('company_id', $companyId)
                ->whereBetween('issue_date', [$startOfMonth, $now])
                ->sum('total_amount_clp'),
            'sessions_completed_month' => TreatmentSession::where('company_id', $companyId)
                ->whereBetween('date', [$startOfMonth, $now])
                ->where('status', AppointmentStatusEnum::COMPLETED)
                ->count(),
            'receivables_total' => $receivables,
            'pending_invoice_total' => $pendingToInvoice,
        ];

        // 6. Distribución de Atenciones
        $distributionData = TreatmentSession::select(
            'items.name',
            DB::raw('count(*) as count')
        )
        ->join('items', 'treatment_sessions.item_id', '=', 'items.id')
        ->where('treatment_sessions.company_id', $companyId)
        ->where('treatment_sessions.status', AppointmentStatusEnum::COMPLETED)
        ->groupBy('items.name')
        ->get();

        return Inertia::render('reports/Index', [
            'cashFlowData' => $cashFlowData,
            'distributionData' => $distributionData,
            'dteStats' => $dteStats,
            'stats' => $stats,
        ]);
    }
}
