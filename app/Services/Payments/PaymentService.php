<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\TreatmentSession;
use App\Models\Agreement; // Nuevo
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\PatientInsurance;
use App\Models\SessionType; // Nuevo (Tu tabla de prestaciones)
use App\Models\PatientPlan;
use App\Models\Plan;
use App\Models\Receivable;
use App\Services\Dte\DteService;
use App\Services\Invoices\InvoiceService;
use App\Services\Treatments\TreatmentService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    // 🎯 Añadimos el ID de la empresa y sucursal para la lógica de cobertura
    private int $companyId;
    private int $branchId;

    public function __construct(
        private WebpayPlusService $webpay,
        private InvoiceService $invoiceService,
        private ?DteService $dteService = null,
        private TreatmentService $sessionService
    ) {}

    /**
     * Procesa un pago completo con múltiples opciones desde el POS.
     * Puede incluir sesiones, deudas o la compra de un plan.
     * 
     * @param array $data Datos del pago
     * @return Payment
     */
    public function processPayment(array $data): Payment
    {
        Log::info('Contenido del carrito antes de procesar:', $data['services_to_bill']);

        return DB::transaction(function () use ($data) {
            // 1. Crear el registro de Pago
            $payment = Payment::create([
                'uuid' => (string) Str::uuid(),
                'user_id' => $data['user_id'],
                'patient_id' => $data['patient_id'],
                'company_id' => $data['company_id'],
                'branch_id' => $data['branch_id'],
                'amount_clp' => $data['payment_details']['amount_paid'],
                'amount_gross_clp' => $data['final_shares']['amount_gross_clp'] ?? 0,
                'amount_insurance_primary_clp' => $data['final_shares']['amount_insurance_primary_clp'] ?? 0,
                'amount_insurance_secondary_clp' => $data['final_shares']['amount_insurance_secondary_clp'] ?? 0,
                'discount_clp' => $data['final_shares']['discount_clp'] ?? 0,
                'payment_method' => $data['payment_details']['payment_method'],
                'payment_date' => $data['payment_details']['payment_date'] ?? now(),
                'liquidation_insurance_id' => $data['coverage_details']['insurance_id'] ?? null,
                'status' => 'pending', // Se actualizará a 'completed' si todo va bien
                'transaction_reference' => $data['coverage_details']['external_transaction_code'] ?? null,
                'metadata' => $data,
            ]);

            // 2. Procesar cada ítem del carrito
            foreach ($data['services_to_bill'] as $item) {
                if (!empty($item['is_plan']) && $item['is_plan']) {
                    $this->handlePlanPurchaseInPos($payment, $item);
                } elseif (!empty($item['invoice_id'])) {
                    $this->handleInvoicePayment($payment, $item);
                } else {
                    if (!empty($item['treatment_session_id']) || !empty($item['session_type_id'])) {
                        $this->handleNewSession($payment, $item, $data);
                    }
                }
            }

            // 3. Registrar Cuentas por Cobrar (si aplica)
            $this->registerInsurancesReceivables($payment, $data);
            
            // 4. Marcar el pago como completado al final de la transacción
            $payment->update(['status' => 'completed']);

            return $payment;
        });
    }

    public function processPlanPurchase(int $patientId, int $planId, array $paymentDetails): Payment
    {
        return DB::transaction(function () use ($patientId, $planId, $paymentDetails) {
            $plan = Plan::findOrFail($planId);
            $patient = Patient::findOrFail($patientId);

            // 1. Crear el registro de Pago
            $payment = Payment::create([
                'uuid' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'patient_id' => $patientId,
                'company_id' => $plan->company_id,
                'branch_id' => $paymentDetails['branch_id'],
                'amount_clp' => $plan->price,
                'amount_gross_clp' => $plan->price,
                'payment_method' => $paymentDetails['payment_method'],
                'payment_date' => $paymentDetails['payment_date'] ?? now(),
                'status' => $paymentDetails['payment_method'] === 'payment_link' ? 'pending' : 'completed',
                'transaction_reference' => $paymentDetails['transaction_reference'] ?? null,
            ]);

            // 2. Generar Invoice
            $invoice = $this->invoiceService->issueInvoiceForPlanPurchase($payment, $plan, $plan->price);

            // 3. Asignar pago a la factura
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'amount_clp' => $plan->price,
            ]);

            // 4. Si ya está pagado (no es link de pago), crear el PatientPlan
            if ($payment->status === 'completed') {
                $patientPlanService = app(\App\Services\Plans\PlanService::class);
                $patientPlanService->purchasePlan($patientId, $planId, $payment->id);
            }

            return $payment;
        });
    }

    private function handlePlanPurchaseInPos(Payment $payment, array $item)
    {
        $plan = Plan::findOrFail($item['plan_id']);
        $patientAmount = $item['unit_patient_clp'] ?? $plan->price;

        // 1. Generar la Invoice por la venta del Plan.
        // Asume que el pago total del POS cubre esta y otras prestaciones.
        $invoice = $this->invoiceService->issueInvoiceForPlanPurchase($payment, $plan, $patientAmount);

        // 2. Asignar la porción correspondiente de este pago a la nueva factura del plan.
        PaymentAllocation::create([
            'payment_id' => $payment->id,
            'invoice_id' => $invoice->id,
            'amount_clp' => $patientAmount,
        ]);

        // 3. Crear la instancia de PatientPlan para el paciente.
        $patientPlanService = app(\App\Services\Plans\PlanService::class);
        $patientPlan = $patientPlanService->purchasePlan($payment->patient_id, $plan->id, $payment->id);

        Log::info('Venta de plan desde POS procesada', [
            'patient_id' => $payment->patient_id,
            'plan_id' => $plan->id,
            'payment_id' => $payment->id,
            'invoice_id' => $invoice->id,
            'patient_plan_id' => $patientPlan->id,
        ]);
    }

    private function handleInvoicePayment(Payment $payment, array $item): void
    {
        $invoice = Invoice::findOrFail($item['invoice_id']);

        PaymentAllocation::create([
            'payment_id' => $payment->id,
            'invoice_id' => $invoice->id,
            'treatment_session_id' => $item['treatment_session_id'] ?? null,
            'amount_clp' => $item['unit_patient_clp'] ?? 0,
        ]);

        // Validar si la factura quedó pagada
        // Recalculamos lo pagado para esta factura
        $paid = PaymentAllocation::where('invoice_id', $invoice->id)->sum('amount_clp');
        if ($paid >= $invoice->total_amount_clp) {
            $invoice->update(['payment_status' => 'paid']);
        } else {
            $invoice->update(['payment_status' => 'partial']);
        }
    }

    private function handleNewSession(Payment $payment, array $item, array $data): void
    {
        // Unimos los datos para el creador de tratamientos
        $result = array_merge($data, $item);
        $consumesPlan = !empty($item['use_plan_id']);

        if ($consumesPlan) {
            $plan = PatientPlan::findOrFail($item['use_plan_id']);
            $plan->increment('sessions_used');
            if ($plan->sessions_used >= $plan->sessions_included) {
                $plan->update(['status' => 'completed']);
            }
        }

        // Determinar ID de Tratamiento (Si no viene, crear uno nuevo)
        $treatmentId = $item['treatment_id'] ?? null;
        if (!$treatmentId) {
            $treatment = $this->sessionService->createTreatmentFromSession($result);
            $treatmentId = $treatment->id;
        }

        // Lógica de "Pago de Sesión Existente" vs "Compra de Nuevas Sesiones"
        $existingSessionId = $item['treatment_session_id'] ?? null;
        
        // CASO 1: Actualizar sesión existente (Solo si cantidad es 1)
        if ($existingSessionId && $item['quantity'] == 1) {
            $session = TreatmentSession::findOrFail($existingSessionId);
            $session->update([
                'status' => 'completed',
                'patient_amount_clp' => $consumesPlan ? 0 : ($item['unit_patient_clp'] ?? 0),
                'consumes_plan' => $consumesPlan,
                'doctor_id' => $item['doctor_id'] ?? $session->doctor_id,
            ]);
            
            $this->createPaidInvoiceAndAllocate($payment, $session, $data, $consumesPlan);
        } 
        // CASO 2: Crear nuevas sesiones (Packs o ventas libres)
        else {
            for ($i = 0; $i < $item['quantity']; $i++) {
                $session = TreatmentSession::create([
                    'company_id' => $data['company_id'],
                    'branch_id' => $data['branch_id'],
                    'treatment_id' => $treatmentId,
                    'patient_id' => $data['patient_id'],
                    'doctor_id' => $item['doctor_id'] ?? null,
                    'session_type_id' => $item['session_type_id'],
                    'date' => $data['payment_details']['payment_date'] ?? now(),
                    'time' => now()->toTimeString(),
                    'patient_amount_clp' => $consumesPlan ? 0 : ($item['unit_patient_clp'] ?? 0),
                    'consumes_plan' => $consumesPlan,
                    'status' => 'completed',
                ]);

                $this->createPaidInvoiceAndAllocate($payment, $session, $data, $consumesPlan);
            }
        }
    }

    // Helper privado para no repetir código dentro de handleNewSession
    private function createPaidInvoiceAndAllocate(Payment $payment, TreatmentSession $session, array $data, bool $consumesPlan) {
        if (!$consumesPlan) {
            // Crear Factura (Boleta) por el monto del paciente
            $invoice = Invoice::create([
                'company_id' => $data['company_id'],
                'branch_id' => $data['branch_id'],
                'user_id' => $payment->user_id,
                'patient_id' => $data['patient_id'],
                'entity_type' => 'Patient',
                'entity_id' => $data['patient_id'],
                
                // Montos
                'total_amount_clp' => $session->patient_amount_clp,
                'amount_patient_clp' => $session->patient_amount_clp,
                'amount_gross_clp' => $session->patient_amount_clp, // Asumiendo 100% copago en este flujo ad-hoc
                
                'payment_status' => 'paid', // Nace pagada
                'dte_status' => 'pending', // Pendiente de emisión
                'issue_date' => now(),
                'dte_type' => 39, // Boleta por defecto
            ]);

            // Crear Ítem de Factura
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'company_id' => $data['company_id'],
                'branch_id' => $data['branch_id'],
                'treatment_session_id' => $session->id,
                'sellable_type' => 'SessionType',
                'sellable_id' => $session->session_type_id,
                'description' => $session->sessionType->name ?? 'Sesión Kinesiológica',
                'quantity' => 1,
                'unit_price_clp' => $session->patient_amount_clp,
                'unit_patient_clp' => $session->patient_amount_clp,
                'total_gross_clp' => $session->patient_amount_clp,
                'total_patient_clp' => $session->patient_amount_clp,
                'is_exento' => $session->sessionType->is_exempt ?? true,
            ]);

            // Asignar el pago a esta factura
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'treatment_session_id' => $session->id,
                'amount_clp' => $session->patient_amount_clp,
            ]);
        }
    }

    private function registerInsurancesReceivables(Payment $payment, array $data): void
    {
        $shares = $data['final_shares'];

        // Seguro Primario (Isapre/Fonasa)
        if ($shares['amount_insurance_primary_clp'] > 0) {
            Receivable::create([
                'company_id' => $data['company_id'],
                'branch_id' => $data['branch_id'],
                'payment_id' => $payment->id,
                'patient_id' => $data['patient_id'],
                'insurance_id' => $data['coverage_details']['insurance_id'],
                'amount_clp' => $shares['amount_insurance_primary_clp'],
                'status' => 'pending',
                'due_date' => now()->addDays(30),
            ]);
        }

        // Seguro Secundario (Complementario)
        if ($shares['amount_insurance_secondary_clp'] > 0) {
            Receivable::create([
                'company_id' => $data['company_id'],
                'branch_id' => $data['branch_id'],
                'payment_id' => $payment->id,
                'patient_id' => $data['patient_id'],
                'insurance_id' => $data['coverage_details']['secondary_insurance_id'],
                'amount_clp' => $shares['amount_insurance_secondary_clp'],
                'status' => 'pending',
                'due_date' => now()->addDays(30),
            ]);
        }
    }

    /**
     * Crea el registro de pago
     */
    private function createPayment(array $data): Payment
    {
        return Payment::create([
            'patient_id' => $data['patient_id'],
            'liquidation_insurance_id' => $data['liquidation_insurance_id'] ?? null,
            'payment_date' => $data['payment_date'] ?? null,
            'amount_clp' => $data['amount_clp'],
            'paid_at' => $data['paid_at'] ?? now(),
            'payment_method' => $data['payment_method'],
            'transaction_reference' => $data['transaction_reference'] ?? null,
            'status' => $data['status'] ?? 'completed',

            // Campos Webpay si aplica
            'webpay_token' => $data['webpay_token'] ?? null,
            'webpay_buy_order' => $data['webpay_buy_order'] ?? null,
            'webpay_session_id' => $data['webpay_session_id'] ?? null,
            'webpay_authorization_code' => $data['webpay_authorization_code'] ?? null,
            'webpay_payment_type_code' => $data['webpay_payment_type_code'] ?? null,
            'webpay_response_code' => $data['webpay_response_code'] ?? null,
            'webpay_installments' => $data['webpay_installments'] ?? null,
            'webpay_card_detail' => $data['webpay_card_detail'] ?? null,
            'webpay_transaction_date' => $data['webpay_transaction_date'] ?? null,
            'webpay_raw_response' => $data['webpay_raw_response'] ?? null,
        ]);
    }

    /**
     * Procesa el cobro completo: Calcula Cobertura (I-Med Simulado), crea Invoices y registra el Payment.
     * * @param array $data { patient_id, services: [ {session_type_id: X, quantity: Y} ], payment_details: [...] }
     * @return Payment
     */
    public function processBillingAndPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {

            $this->companyId = $data['company_id'];
            $this->branchId = $data['branch_id'];

            // 1. CÁLCULO DE COBERTURA (I-Med Simulado)
            // Esto devuelve el copago, la cobertura, y los ítems detallados.
            $calculation = $this->calculateCoverage($data['patient_id'], $data['services']);
            $totals = $calculation['totals'];

            // El monto a pagar por el paciente es el Copago calculado
            $copagoAmount = $totals['patient_share_clp'];

            // 2. CREAR LAS INVOICES (Paciente por Copago, Aseguradora por Cobertura)
            $invoiceIds = $this->createInvoicesFromCoverage(
                $data['patient_id'],
                $calculation
            );

            // 3. CREAR EL PAGO (Ahora sabemos exactamente cuánto debe pagar el paciente)
            $paymentData = array_merge($data, [
                'amount_clp' => $copagoAmount, // Monto exacto del copago
                'invoice_ids' => $invoiceIds, // Para vincular el pago a las Invoices
            ]);
            $payment = $this->createPayment($paymentData);

            // 4. ASIGNAR EL PAGO
            // Debes decidir a qué se asigna. Si la Invoice es el documento final,
            // podrías asignar el pago a la Invoice del paciente (deuda).
            // Por simplicidad, asignaremos el pago a la factura del paciente.
            $this->allocateToInvoice($payment, $invoiceIds['patient_invoice_id']);

            return $payment->fresh(['paymentAllocation', 'invoice']);
        });
    }


    /**
     * Calcula la cobertura y devuelve el desglose total (I-Med Simulado).
     * * @param int $patientId
     * @param array $servicesToBill Array de {session_type_id: X, quantity: Y}
     * @return array Devuelve [insurance_id, totals, items]
     * @throws \Exception si no encuentra convenio activo siendo asegurado
     */
    private function calculateCoverage(int $patientId, array $servicesToBill): array
    {
        $patient = Patient::findOrFail($patientId);

        // Obtener Plan Activo del Paciente usando la tabla pivot
        $activePlan = $patient->insurances()
            ->using(PatientInsurance::class)
            ->wherePivot('is_active', true)
            ->with(['pivot.plan', 'pivot.insurance'])
            ->first();

        // 1. CASO PARTICULAR: Si no tiene un plan activo.
        if (!$activePlan) {
            Log::info("Paciente ID {$patientId} cobrado como Particular.");
            return $this->handleParticular($servicesToBill);
        }

        // 2. BUSCAR EL TARIFARIO (Agreement) de NUESTRA CLÍNICA con estrategia de fallback
        $agreement = Agreement::where('company_id', $this->companyId)
            ->where('insurance_id', $activePlan->pivot->insurance_id)
            ->where('is_active', true)
            // Prioriza el convenio específico de la sucursal, luego el global
            ->orderByRaw('branch_id IS NULL ASC, branch_id = ? DESC', [$this->branchId])
            ->first();

        // 3. VALIDACIÓN CRÍTICA: Si el paciente tiene plan, pero la clínica no tiene el tarifario.
        if (!$agreement) {
            // Podrías devolver handleParticular aquí o lanzar un error. Lanzar error es más seguro.
            throw new \Exception("Paciente asegurado, pero la clínica no tiene un convenio activo para {$activePlan->name}.");
        }

        // 4. INICIALIZACIÓN DE ACUMULADORES
        $totalGross = 0;
        $totalPatientShare = 0;
        $totalInsuranceShare = 0;
        $invoiceItems = [];

        // 5. PROCESAR CADA SERVICIO
        foreach ($servicesToBill as $serviceData) {
            $sessionId = $serviceData['session_type_id'];
            $quantity = $serviceData['quantity'] ?? 1;

            // Buscar Regla de Cobertura (Agreement Item) más específica
            $coverageItem = $agreement->items()
                ->where('session_type_id', $sessionId)
                ->where('plan_id', $activePlan->pivot->plan_id)
                ->first();

            // Si no se encuentra la regla específica, buscar la regla general (sin plan)
            if (!$coverageItem) {
                $coverageItem = $agreement->items()
                    ->where('session_type_id', $sessionId)
                    ->whereNull('plan_id')
                    ->first();
            }

            $service = SessionType::find($sessionId);
            if (!$service) {
                Log::warning("Servicio ID {$sessionId} no existe en el maestro. Saltando.");
                continue;
            }

            // 6. APLICAR COBERTURA O COBRO PARTICULAR POR ÍTEM
            if (!$coverageItem) {
                // No hay cobertura definida para este servicio/plan específico -> Cobro Particular del ítem
                $gross = $service->base_price_clp * $quantity;
                $patient = $gross;
                $insurance = 0;
                $agreementId = null;
                Log::info("Servicio {$sessionId} no cubierto por convenio. Cobrado particular.");
            } else {
                // Aplicar montos del tarifario interno
                $gross = $coverageItem->gross_price_clp * $quantity;
                $patient = $coverageItem->patient_share_clp * $quantity;
                $insurance = $coverageItem->insurance_share_clp * $quantity;
                $agreementId = $coverageItem->id;
            }

            // 7. ACUMULAR Y PREPARAR DATOS
            $totalGross += $gross;
            $totalPatientShare += $patient;
            $totalInsuranceShare += $insurance;

            $invoiceItems[] = [
                'company_id' => $this->companyId,
                'branch_id' => $this->branchId,
                'session_type_id' => $sessionId,
                'agreement_rule_id' => $agreementId,
                'description' => $service->name,
                'quantity' => $quantity,
                'unit_price_clp' => $gross / $quantity,
                'total_gross_amount' => $gross,
                'patient_share_clp' => $patient,
                'insurance_share_clp' => $insurance,
                'invoice_line_total_clp' => $patient, // El monto que se le boletea al paciente
            ];
        }

        // 8. DEVOLVER RESULTADOS FINALES
        return [
            'insurance_id' => $activePlan->pivot->insurance_id,
            'totals' => [
                'total_gross_amount' => $totalGross,
                'patient_share_clp' => $totalPatientShare,
                'insurance_share_clp' => $totalInsuranceShare,
            ],
            'items' => $invoiceItems,
        ];
    }

    /**
     * Crea las Invoices de Paciente y Aseguradora basadas en el cálculo de cobertura.
     */
    private function createInvoicesFromCoverage(int $patientId, array $calculation): array
    {
        $patient = Patient::findOrFail($patientId);
        $totals = $calculation['totals'];
        $items = $calculation['items'];
        $insuranceId = $calculation['insurance_id'];
        $invoiceIds = ['patient_invoice_id' => null, 'insurance_invoice_id' => null];

        // 1. FACTURA PACIENTE (COPAGO)
        if ($totals['patient_share_clp'] > 0) {
            $patientInvoice = $this->createInvoice(
                'Patient',
                $patient->id,
                $patient,
                $insuranceId,
                $totals['patient_share_clp'],
                $totals
            );
            $patientInvoice->items()->createMany($items);
            $invoiceIds['patient_invoice_id'] = $patientInvoice->id;
        }

        // 2. FACTURA ASEGURADORA (CUENTAS POR COBRAR)
        if ($totals['insurance_share_clp'] > 0) {
            $insuranceInvoice = $this->createInvoice(
                'Insurance',
                $insuranceId, // El ID de la aseguradora
                $patient,
                $insuranceId,
                $totals['insurance_share_clp'],
                $totals
            );
            $insuranceInvoice->items()->createMany($items);
            $invoiceIds['insurance_invoice_id'] = $insuranceInvoice->id;
        }

        return $invoiceIds;
    }

    /**
     * Función base para crear una Invoice
     */
    private function createInvoice(
        string $entityType,
        int $entityId,
        Patient $patient,
        ?int $insuranceId,
        int $payableAmount,
        array $totals // Usar $totals en lugar de $branchId
    ): Invoice {
        // ... (El contenido de createInvoice se mantiene, usando $this->companyId y $this->branchId) ...
        $isPatient = $entityType === 'Patient';

        return Invoice::create([
            'company_id' => $this->companyId,
            'branch_id' => $this->branchId,
            'patient_id' => $patient->id,

            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'insurance_id' => $insuranceId,

            'total_gross_amount' => $totals['total_gross_amount'],
            'patient_share_clp' => $totals['patient_share_clp'],
            'insurance_share_clp' => $totals['insurance_share_clp'],

            'net_clp' => $isPatient ? $payableAmount : 0,
            'iva_clp' => 0,
            'total_clp' => $payableAmount,

            'issue_date' => now()->toDateString(),
            'dte_type' => $isPatient ? 39 : 33,
            'dte_status' => 'PENDIENTE',
        ]);
    }

    /**
     * Asigna un pago a una Invoice específica (copago)
     */
    public function allocateToInvoice(Payment $payment, int $invoiceId): void
    {
        $invoice = Invoice::findOrFail($invoiceId);

        // 🎯 VALIDACIÓN DE SEGURIDAD: Evitar sobre-pagos
        $alreadyAllocated = PaymentAllocation::where('invoice_id', $invoice->id)->sum('amount_clp');
        $balance = $invoice->total_amount_clp - $alreadyAllocated;

        $amountToAllocate = min($payment->amount_clp, $balance);

        if ($amountToAllocate <= 0) {
            Log::info("La Factura ID {$invoice->id} ya está totalmente pagada. Saltando asignación.");
            return;
        }

        // Crear asignación
        PaymentAllocation::create([
            'payment_id' => $payment->id,
            'invoice_id' => $invoice->id, // Asignamos directamente a la Invoice
            'treatment_session_id' => null,
            'amount_clp' => $amountToAllocate,
        ]);

        // Actualizar estado de la factura
        if (($alreadyAllocated + $amountToAllocate) >= $invoice->total_amount_clp) {
            $invoice->update(['payment_status' => 'paid']); 
        }
    }

    /**
     * Asigna un pago a múltiples sesiones (buscando sus facturas)
     */
    public function allocateToSessions(Payment $payment, $sessionIds): void
    {
        // Buscar facturas impagas asociadas a estas sesiones
        $invoiceIds = Invoice::whereHas('items', function($q) use ($sessionIds) {
             $q->whereIn('treatment_session_id', $sessionIds);
        })->whereIn('payment_status', ['unpaid', 'partial'])
          ->pluck('id')
          ->toArray();

        if (!empty($invoiceIds)) {
             $this->allocateToInvoices($payment, $invoiceIds);
        }

        Log::info('Payment allocated to sessions (via invoices)', [
            'payment_id' => $payment->id,
            'session_ids' => $sessionIds,
            'invoice_ids' => $invoiceIds
        ]);
    }

    /**
     * Maneja el caso en que el paciente no tiene un plan activo o el servicio no tiene cobertura.
     * Cobra el 100% al paciente.
     */
    private function handleParticular(array $servicesToBill): array
    {
        $companyId = $this->companyId; // Usamos la variable de la clase
        $branchId = $this->branchId;

        $totalGross = 0;
        $invoiceItems = [];

        foreach ($servicesToBill as $serviceData) {
            $sessionId = $serviceData['session_type_id'];
            $quantity = $serviceData['quantity'] ?? 1;

            // 1. Obtener el precio base del servicio desde el maestro
            $service = SessionType::find($sessionId);

            if (!$service) {
                // Manejar error o saltar si el servicio no existe
                Log::warning("Servicio ID {$sessionId} no encontrado para paciente particular.");
                continue;
            }

            // Asumimos que el precio base es el que se cobra al particular
            $gross = $service->base_price_clp * $quantity;
            $totalGross += $gross;

            // 2. Definición de la Cobertura (100% paciente, 0% aseguradora)
            $patientShare = $gross;
            $insuranceShare = 0;

            // 3. Preparar el item para la Invoice
            $invoiceItems[] = [
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'session_type_id' => $sessionId,
                'agreement_rule_id' => null, // No se usó ningún convenio
                'description' => $service->name,
                'quantity' => $quantity,
                'unit_price_clp' => $service->base_price_clp,
                'total_gross_amount' => $gross,
                'patient_share_clp' => $patientShare,
                'insurance_share_clp' => $insuranceShare,
                'invoice_line_total_clp' => $patientShare,
            ];
        }

        // Devolver el resultado para ser usado por createInvoicesAndProcessPayment
        return [
            'insurance_id' => null, // No hay aseguradora involucrada
            'totals' => [
                'total_gross_amount' => $totalGross,
                'patient_share_clp' => $totalGross, // El total bruto es el copago del paciente
                'insurance_share_clp' => 0,
            ],
            'items' => $invoiceItems,
        ];
    }

    /**
     * Calcula el estado de una deuda
     */
    private function calculateDebtStatus(int $original, int $paid, ?\DateTime $dueDate): string
    {
        if ($paid >= $original) {
            return 'paid';
        }

        if ($paid > 0) {
            return 'partial';
        }

        if ($dueDate && $dueDate < now()) {
            return 'overdue';
        }

        return 'pending';
    }


    /**
     * Inicia una transacción Webpay
     */
    public function initiateWebpayTransaction(array $data): array
    {
        $buyOrder = $this->generateBuyOrder($data['patient_id']);
        $sessionId = 'patient:' . $data['patient_id'];
        $amount_clp = $data['amount_clp'];

        // Crear registro de pago en estado pending
        $payment = Payment::create([
            'patient_id' => $data['patient_id'],
            'treatment_id' => $data['treatment_id'] ?? null,
            'treatment_session_id' => $data['treatment_session_id'] ?? null,
            'payment_date' => now(),
            'amount_clp' => $amount_clp,
            'payment_method' => 'webpay_credit', // Se actualizará después
            'status' => 'pending',
            'webpay_buy_order' => $buyOrder,
            'webpay_session_id' => $sessionId,
            'notes' => $data['notes'] ?? null,
        ]);


        // Llamar a Webpay
        $result = $this->webpay->createTransaction($buyOrder, $sessionId, $amount_clp);

        // Actualizar con el token
        $payment->update(['webpay_token' => $result['token']]);

        return [
            'payment_id' => $payment->id,
            'url' => $result['url'] . '?token_ws=' . $result['token'],
            'token' => $result['token'],
        ];
    }

    /**
     * Confirma una transacción Webpay
     */
    public function confirmWebpayTransaction(string $token): Payment
    {
        return DB::transaction(function () use ($token) {
            // Buscar el pago por token
            $payment = Payment::where('webpay_token', $token)->firstOrFail();

            // Commit en Webpay
            $commit = $this->webpay->commit($token);

            // Determinar método de pago según payment_type_code
            $paymentMethod = $this->mapWebpayPaymentType($commit['payment_type_code'] ?? 'VD');

            // Actualizar pago con datos de Webpay
            $payment->update([
                'status' => $commit['status'] === 'AUTHORIZED' && $commit['response_code'] === 0
                    ? 'completed'
                    : 'failed',
                'payment_method' => $paymentMethod,
                'paid_at' => $commit['status'] === 'AUTHORIZED' ? now() : null,
                'webpay_authorization_code' => $commit['authorization_code'] ?? null,
                'webpay_payment_type_code' => $commit['payment_type_code'] ?? null,
                'webpay_response_code' => $commit['response_code'] ?? null,
                'webpay_installments' => $commit['installments_number'] ?? null,
                'webpay_card_detail' => $commit['card_detail'] ?? null,
                'webpay_transaction_date' => $commit['transaction_date'] ?? null,
                'webpay_raw_response' => $commit,
            ]);

            return $payment;
        });
    }

    /**
     * Mapea el código de tipo de pago de Webpay a nuestro enum
     */
    private function mapWebpayPaymentType(?string $code): string
    {
        return match ($code) {
            'VD' => 'webpay_debit',      // Venta Débito
            'VN' => 'webpay_credit',     // Venta Normal (Crédito)
            'VC' => 'webpay_credit',     // Venta en cuotas
            'SI' => 'webpay_credit',     // 3 cuotas sin interés
            'S2' => 'webpay_credit',     // 2 cuotas sin interés
            'NC' => 'webpay_credit',     // N cuotas sin interés
            'VP' => 'webpay_prepaid',    // Venta Prepago
            default => 'webpay_credit',
        };
    }

    /**
     * Genera un buy_order único
     */
    private function generateBuyOrder(int $patientId): string
    {
        $prefix = config('webpay.buy_order_prefix', 'WP');
        $timestamp = now()->format('YmdHis');
        $random = str_pad($patientId, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$timestamp}{$random}";
    }



    /**
     * Asigna un pago a facturas pendientes
     */
    public function allocateToInvoices(Payment $payment, array $invoiceIds, bool $isPartial = false): void
    {
        DB::transaction(function () use ($payment, $invoiceIds, $isPartial) {
            $remainingAmount = $payment->amount_clp;

            foreach ($invoiceIds as $invoiceId) {
                if ($remainingAmount <= 0) break;

                $invoice = Invoice::findOrFail($invoiceId);
                
                // Calcular saldo pendiente de la factura
                $paidSoFar = $invoice->paymentAllocations()->sum('amount_clp');
                $balance = $invoice->total_amount_clp - $paidSoFar;

                if ($balance <= 0) continue;

                $amountToAllocate = min($remainingAmount, $balance);

                // Crear asignación
                PaymentAllocation::create([
                    'payment_id' => $payment->id,
                    'invoice_id' => $invoice->id,
                    'amount_clp' => $amountToAllocate,
                ]);

                // Actualizar factura
                $newPaid = $paidSoFar + $amountToAllocate;
                if ($newPaid >= $invoice->total_amount_clp) {
                    $invoice->update(['payment_status' => 'paid']);
                } else {
                    $invoice->update(['payment_status' => 'partial']);
                }

                $remainingAmount -= $amountToAllocate;
            }

            Log::info('Payment allocated to invoices', [
                'payment_id' => $payment->id,
                'invoice_ids' => $invoiceIds,
                'is_partial' => $isPartial,
            ]);
        });
    }

    /**
     * Asigna un pago a un plan
     */
    public function allocateToPlan(Payment $payment, int $planId): void
    {
        DB::transaction(function () use ($payment, $planId) {
            // Crear o actualizar PatientPlan
            $patientPlan = PatientPlan::firstOrCreate([
                'patient_id' => $payment->patient_id,
                'plan_id' => $planId,
            ], [
                'start_date' => now(),
                'status' => 'active',
            ]);

            // Crear asignación
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'patient_plan_id' => $patientPlan->id,
                'amount_clp' => $payment->amount_clp,
            ]);

            Log::info('Payment allocated to plan', [
                'payment_id' => $payment->id,
                'plan_id' => $planId,
                'patient_plan_id' => $patientPlan->id,
            ]);
        });
    }

    /**
     * Generar Factura Pendiente automáticamente al crear una sesión
     */
    public function createPendingInvoiceForSession(TreatmentSession $session, ?int $customAmount = null): Invoice
    {
        return DB::transaction(function () use ($session, $customAmount) {
            // Determinar monto
            $amount_clp = $customAmount ?? $this->calculateSessionAmount($session);

            // Crear Factura Pendiente
            $invoice = Invoice::create([
                'company_id' => $session->company_id,
                'branch_id' => $session->branch_id,
                // 'user_id' => auth()->id(), // Ojo, puede ser null en jobs
                'patient_id' => $session->patient_id,
                'entity_type' => 'Patient',
                'entity_id' => $session->patient_id,
                
                'total_amount_clp' => $amount_clp,
                'amount_patient_clp' => $amount_clp,
                'amount_gross_clp' => $amount_clp,
                
                'payment_status' => 'unpaid',
                'dte_status' => 'pending',
                'issue_date' => now(),
                'dte_type' => 39,
            ]);

            // Crear Ítem
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'company_id' => $session->company_id,
                'branch_id' => $session->branch_id,
                'treatment_session_id' => $session->id,
                'sellable_type' => 'SessionType',
                'sellable_id' => $session->session_type_id,
                'description' => $session->sessionType->name ?? 'Sesión Kinesiológica',
                'quantity' => 1,
                'unit_price_clp' => $amount_clp,
                'unit_patient_clp' => $amount_clp,
                'total_gross_clp' => $amount_clp,
                'total_patient_clp' => $amount_clp,
                'is_exento' => $session->sessionType->is_exempt ?? true,
            ]);

            Log::info('Factura pendiente creada para sesión', [
                'invoice_id' => $invoice->id,
                'treatment_session_id' => $session->id,
                'amount_clp' => $amount_clp,
            ]);

            return $invoice;
        });
    }

    /**
     * Registrar un pago y asignarlo a deudas pendientes
     */
    public function registerPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            // Crear el pago
            $payment = Payment::create([
                'patient_id' => $data['patient_id'],
                'liquidation_insurance_id' => $data['liquidation_insurance_id'] ?? null,
                'treatment_id' => $data['treatment_id'] ?? null,
                'treatment_session_id' => $data['treatment_session_id'] ?? null,
                'date' => $data['date'] ?? now(),
                'concept' => $data['concept'],
                'amount_clp' => $data['amount_clp'],
                'copay_clp' => $data['copay_clp'] ?? 0,
                'insurance_covered_clp' => $data['insurance_covered_clp'] ?? 0,
                'payment_method' => $data['payment_method'],
                'status' => $data['status'] ?? 'completed',
                'paid_at' => $data['paid_at'] ?? now(),
                'invoice' => $data['invoice'] ?? $this->generateInvoiceNumber(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Si hay deudas pendientes, asignar automáticamente
            if (isset($data['auto_allocate']) && $data['auto_allocate']) {
                $this->autoAllocatePayment($payment);
            }

            // Si se especificaron facturas específicas
            if (isset($data['invoice_ids']) && is_array($data['invoice_ids'])) {
                $this->allocateToInvoices($payment, $data['invoice_ids']);
            }

            Log::info('Pago registrado', [
                'payment_id' => $payment->id,
                'patient_id' => $payment->patient_id,
                'amount_clp' => $payment->amount_clp,
            ]);

            return $payment->fresh();
        });
    }

    /**
     * Asignar pago automáticamente a facturas pendientes (FIFO)
     */
    private function autoAllocatePayment(Payment $payment): void
    {
        // Obtener facturas pendientes del paciente, ordenadas por antigüedad
        $pendingInvoices = Invoice::where('patient_id', $payment->patient_id)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->orderBy('issue_date')
            ->get();

        $remainingAmount = $payment->amount_clp;

        foreach ($pendingInvoices as $invoice) {
            if ($remainingAmount <= 0) break;

            // Calcular saldo pendiente
            $paidSoFar = $invoice->paymentAllocations()->sum('amount_clp');
            $balance = $invoice->total_amount_clp - $paidSoFar;

            if ($balance <= 0) continue;

            // Cuánto asignar a esta factura
            $amountToAllocate = min($remainingAmount, $balance);

            // Crear la asignación
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'amount_clp' => $amountToAllocate,
            ]);

            // Actualizar factura
            $newPaid = $paidSoFar + $amountToAllocate;
            if ($newPaid >= $invoice->total_amount_clp) {
                $invoice->update(['payment_status' => 'paid']);
            } else {
                $invoice->update(['payment_status' => 'partial']);
            }

            $remainingAmount -= $amountToAllocate;

            Log::info('Pago asignado a factura', [
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'amount_clp' => $amountToAllocate,
            ]);
        }

        // Si sobró dinero, podría ser crédito a favor o error
        if ($remainingAmount > 0) {
            Log::warning('Pago excede facturas pendientes', [
                'payment_id' => $payment->id,
                'remaining_amount' => $remainingAmount,
            ]);
        }
    }



    /**
     * Verificar si el paciente tiene un plan activo
     */
    public function hasActivePlan(int $patientId, ?int $treatmentId = null): bool
    {
        // AJUSTAR según tu tabla de planes
        // return PatientPlan::where('patient_id', $patientId)
        //     ->where('status', 'active')
        //     ->when($treatmentId, fn($q) => $q->where('treatment_id', $treatmentId))
        //     ->where('start_date', '<=', now())
        //     ->where(fn($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', now()))
        //     ->exists();

        return false; // Placeholder
    }

    /**
     * Consumir sesión de un plan
     */
    public function consumePlanSession(int $patientId, TreatmentSession $session): bool
    {
        // AJUSTAR según tu tabla de planes
        // $plan = PatientPlan::where('patient_id', $patientId)
        //     ->where('status', 'active')
        //     ->where('used_sessions', '<', DB::raw('total_sessions'))
        //     ->first();

        // if ($plan) {
        //     $plan->increment('used_sessions');
        //     Log::info('Sesión consumida del plan', [
        //         'plan_id' => $plan->id,
        //         'session_id' => $session->id,
        //         'remaining' => $plan->total_sessions - $plan->used_sessions,
        //     ]);
        //     return true;
        // }

        return false;
    }

    /**
     * Calcular monto de una sesión (con plan o sin plan)
     */
    private function calculateSessionAmount(TreatmentSession $session): int
    {
        // Si tiene plan activo y sesiones disponibles, costo = 0
        if ($this->hasActivePlan($session->patient_id, $session->treatment_id)) {
            if ($this->consumePlanSession($session->patient_id, $session)) {
                return 0; // Sin deuda, pagado por el plan
            }
        }

        // Sin plan, usar precio de la sesión o default
        return $session->patient_amount_clp ?? $this->getDefaultSessionPrice($session);
    }

    /**
     * Obtener precio default de sesión
     */
    private function getDefaultSessionPrice(TreatmentSession $session): int
    {
        // Buscar en SessionType o configuración
        if ($session->sessionType && $session->sessionType->price) {
            return $session->sessionType->price;
        }

        // O precio fijo
        return 30000; // $30.000 CLP por defecto
    }

    /**
     * Generar número de boleta/factura
     */
    private function generateInvoiceNumber(): string
    {
        $lastPayment = Payment::whereNotNull('invoice')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastPayment && $lastPayment->invoice) {
            // Extraer número y sumar 1
            preg_match('/\d+/', $lastPayment->invoice, $matches);
            $number = isset($matches[0]) ? intval($matches[0]) + 1 : 1;
        } else {
            $number = 1;
        }

        return 'BOL-' . date('Y') . '-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Marcar deudas vencidas como overdue (Pendiente implementación en Invoices)
     */
    /* public function markOverdueDebts(): int
    {
        // ...
    } */

    /**
     * Obtener resumen financiero del paciente
     */
    public function getPatientFinancialSummary(int $patientId): array
    {
        // Calcular deuda basada en facturas pendientes
        $invoices = Invoice::where('patient_id', $patientId)->get();
        
        $payments = Payment::where('patient_id', $patientId)
            ->where('status', 'completed')
            ->get();

        $totalInvoiced = $invoices->sum('total_amount_clp');
        
        // Calcular lo pagado revisando las asignaciones o el estado
        // Opción A: Sumar payment_allocations
        // Opción B: Sumar payments (pero un pago puede no estar asignado)
        // Usaremos Allocations para ser precisos con la deuda
        $totalPaid = PaymentAllocation::whereHas('invoice', function($q) use ($patientId) {
            $q->where('patient_id', $patientId);
        })->sum('amount_clp');

        $pendingBalance = $totalInvoiced - $totalPaid;

        return [
            'total_debt' => $totalInvoiced,
            'total_paid' => $totalPaid,
            'pending_balance' => $pendingBalance,
            // 'overdue_debts' => $debts->where('status', 'overdue')->count(), // Pendiente definir qué es overdue en invoice
            'payment_history' => $payments->map(function ($p) {
                return [
                    'date' => $p->payment_date,
                    'amount_clp' => $p->amount_clp,
                    'method' => $p->payment_method,
                    'invoice' => $p->paymentAllocation->first()?->invoice->id ?? 'N/A', // Referencia
                ];
            }),
        ];
    }

    /**
     * Reembolsar un pago
     */
    public function refundPayment(Payment $payment, string $reason): Payment
    {
        return DB::transaction(function () use ($payment, $reason) {
            if ($payment->status === 'refunded') {
                throw new \Exception('El pago ya fue reembolsado');
            }

            // Revertir asignaciones a facturas
            $allocations = PaymentAllocation::where('payment_id', $payment->id)->get();

            foreach ($allocations as $allocation) {
                $invoice = $allocation->invoice;
                
                if ($invoice) {
                    // Si se anula el pago, la factura vuelve a estar impaga (o parcial)
                    // Como quitamos el monto pagado, asumimos que retrocede.
                    // Simplificación: Si tenía 'paid', pasa a 'partial' o 'unpaid'.
                    // Lo ideal es recalcular el saldo.
                    $currentPaid = PaymentAllocation::where('invoice_id', $invoice->id)
                        ->where('id', '!=', $allocation->id) // Excluir este
                        ->sum('amount_clp');
                    
                    if ($currentPaid <= 0) {
                        $invoice->payment_status = 'unpaid';
                    } else {
                        $invoice->payment_status = 'partial';
                    }
                    $invoice->save();
                }

                $allocation->delete();
            }

            // Marcar pago como reembolsado
            $payment->update([
                'status' => 'refunded',
                'notes' => ($payment->notes ?? '') . "\n\nReembolso: {$reason}",
            ]);

            Log::info('Pago reembolsado', [
                'payment_id' => $payment->id,
                'reason' => $reason,
            ]);

            return $payment->fresh();
        });
    }
}
