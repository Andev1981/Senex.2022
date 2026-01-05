<?php

namespace App\Http\Controllers\Admin\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Payroll;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function index()
    {
        $activeBranchId = session('active_branch_id');

        $payrolls = Payroll::with('doctor')
            ->orderBy('created_at', 'desc')
            ->get();

        // FILTRO CORRECTO: Solo doctores activos en la sucursal actual
        $doctors = Doctor::whereHas('branches', function ($query) use ($activeBranchId) {
            $query->where('branches.id', $activeBranchId)
                  ->where('branch_doctor.status', 'active');
        })->get(['id', 'name', 'last_name']);

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrolls,
            'doctors' => $doctors
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
        ]);

        try {
            $payroll = $this->payrollService->buildForPeriod(
                $validated['doctor_id'],
                $validated['period_start'],
                $validated['period_end']
            );

            session()->flash('message', "✅ Liquidación generada exitosamente.");
            session()->flash('type', 'success');
            
            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Payroll $payroll)
    {
        $payroll->load([
            'doctor', 
            'details.patient', 
            'details.sessionType'
        ]);
        
        return response()->json($payroll);
    }

    public function downloadPdf(Payroll $payroll)
    {
        $payroll->load([
            'doctor', 
            'details.patient', 
            'details.sessionType'
        ]);

        $pdf = \PDF::loadView('pdf.payroll_liquidation', compact('payroll'));
        
        return $pdf->download("liquidacion_{$payroll->id}_{$payroll->doctor->last_name}.pdf");
    }

    public function approve(Payroll $payroll)
    {
        $this->payrollService->approve($payroll);
        return back();
    }

    public function markPaid(Payroll $payroll)
    {
        $this->payrollService->markPaid($payroll);
        return back();
    }

    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return back();
    }
}
