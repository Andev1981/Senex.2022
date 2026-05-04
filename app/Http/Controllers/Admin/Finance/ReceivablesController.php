<?php

namespace App\Http\Controllers\Admin\Finance;

use App\Http\Controllers\Controller;
use App\Models\Receivable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReceivablesController extends Controller
{
    public function index()
    {
        $currentCompanyId = session('current_company_id');
        
        $allReceivables = Receivable::where('company_id', $currentCompanyId)
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->with(['patient', 'insurance', 'payment'])
            ->orderBy('due_date', 'asc')
            ->get();

        $totalDebt = $allReceivables->sum('amount_clp');

        // Separar por tipo para el frontend
        $insurerReceivables = $allReceivables->whereNotNull('insurance_id')->values();
        $patientReceivables = $allReceivables->whereNull('insurance_id')->values();

        return Inertia::render('finance/Receivables/Index', [
            'totalDebt' => $totalDebt,
            'patientReceivables' => $patientReceivables,
            'insurerReceivables' => $insurerReceivables,
            'allReceivables' => $allReceivables
        ]);
    }

    /**
     * Marca un receivable como liquidado/pagado.
     */
    public function settle(Request $request, Receivable $receivable)
    {
        $receivable->update([
            'status' => 'settled',
            'settled_at' => now(),
            'notes' => $receivable->notes . "\n[Liquidado manualmente vía Cuentas por Cobrar]"
        ]);

        return back()->with('success', 'Cobro registrado exitosamente.');
    }
}
