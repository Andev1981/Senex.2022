<?php

namespace App\Http\Controllers\Admin\Plans;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Plan;
use App\Models\PatientPlan;
use App\Services\Plans\PlanService;
use App\Services\Payments\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PatientPlanController extends Controller
{
    protected $planService;
    protected $paymentService;

    public function __construct(PlanService $planService, PaymentService $paymentService)
    {
        $this->planService = $planService;
        $this->paymentService = $paymentService;
    }

    /**
     * Procesa la compra/asignación de un pack comercial a un paciente.
     */
    public function store(Request $request)
    {
        // Fallback: Si no viene branch_id, lo tomamos de la sesión
        if (!$request->has('payment_details.branch_id')) {
            $paymentDetails = $request->input('payment_details', []);
            $paymentDetails['branch_id'] = session('active_branch_id');
            $request->merge(['payment_details' => $paymentDetails]);
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'plan_id'    => 'required|exists:plans,id',
            'payment_details.payment_method' => 'required|string',
            'payment_details.branch_id' => 'required|exists:branches,id',
            'payment_details.payment_date' => 'nullable|date',
            'payment_details.transaction_reference' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $patientId = $validated['patient_id'];
            $planId = $validated['plan_id'];
            $paymentMethod = $validated['payment_details']['payment_method'];
            $branchId = $validated['payment_details']['branch_id'];

            // 1. Asignar el Plan (Suscripción)
            $patientPlan = $this->planService->purchasePlan($patientId, $planId);

            // 2. Ejecutar lógica de cobro profesional
            if ($paymentMethod === 'payment_link') {
                // Link de Pago: Solo genera deuda (Receivable pendiente)
                $this->paymentService->generatePlanDebt($patientPlan, $branchId);
            } elseif ($paymentMethod === 'postpaid') {
                // Cobro Posterior: Solo genera deuda, igual que el link pero sin disparar link de pago
                $this->paymentService->generatePlanDebt($patientPlan, $branchId);
            } else {
                // Pago Inmediato: Genera deuda + Pago + Settle
                $this->paymentService->processPlanPurchaseLegacy(
                    $patientPlan, 
                    $validated['payment_details']
                );
            }

            DB::commit();

            // 3. Notificar al Paciente
            try {
                $patientPlan->patient->notify(new \App\Notifications\PlanPurchasedNotification($patientPlan));
            } catch (\Exception $e) {
                Log::warning("No se pudo enviar notificación de compra de plan: " . $e->getMessage());
            }

            return back()->with('success', 'Pack asignado y procesado correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error en venta de pack: " . $e->getMessage());
            return back()->withErrors(['plan_id' => 'No se pudo procesar la venta: ' . $e->getMessage()]);
        }
    }
}
