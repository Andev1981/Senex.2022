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
    public function index()
    {
        $activeBranchId = session('active_branch_id');
        
        $invoices = Invoice::where('branch_id', $activeBranchId)
            ->whereMonth('issue_date', now()->month)
            ->whereYear('issue_date', now()->year)
            ->get();

        // 1. Distribución por tipo de DTE
        $dteDistribution = $invoices->groupBy('dte_type')->map(function ($group, $type) {
            $names = [33 => 'Factura', 34 => 'Fact. Exenta', 39 => 'Boleta', 41 => 'Bol. Exenta', 61 => 'N. Crédito'];
            return [
                'name' => $names[$type] ?? 'Otro',
                'value' => $group->count(),
            ];
        })->values();

        // 2. Distribución por método de pago
        $paymentDistribution = $invoices->groupBy(function($i) {
            return $i->metadata['payment_method'] ?? 'Efectivo';
        })->map(function ($group, $method) {
            return [
                'name' => $method,
                'value' => $group->sum('amount_total_clp'),
            ];
        })->values();

        $stats = [
            'total_facturado' => $invoices->sum('amount_total_clp'),
            'count_dtes' => $invoices->count(),
            'count_accepted' => $invoices->where('dte_status', 'accepted')->count(),
            'dte_distribution' => $dteDistribution,
            'payment_distribution' => $paymentDistribution,
        ];

        return Inertia::render('Dashboard', [
            'dte_stats' => $stats
        ]);
    }
}
