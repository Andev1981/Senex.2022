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
        $allReceivables = Receivable::whereIn('status', ['pending', 'partial', 'overdue'])->get();

        $totalDebt = $allReceivables->sum(function($receivable) {
            return $receivable->amount - $receivable->paid_amount;
        });

        $patientReceivables = $allReceivables->where('type', 'copay')->load('payable');
        $insurerReceivables = $allReceivables->where('type', 'insurance_refund')->load('payable');

        return Inertia::render('finance/Receivables/Index', [
            'totalDebt' => $totalDebt,
            'patientReceivables' => $patientReceivables,
            'insurerReceivables' => $insurerReceivables,
        ]);
    }
}
