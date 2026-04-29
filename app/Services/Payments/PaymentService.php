<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\TreatmentSession;
use App\Models\Agreement; // Nuevo
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Receivable;
use App\Enums\FinanceStatusEnum;
use App\Enums\DteStatusEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentService
{
    protected $webpay;

    public function __construct(WebpayPlusService $webpay)
    {
        $this->webpay = $webpay;
    }

    /**
     * Alias for registerLocalPayment used by POS
     */
    public function registerLocalPayment(array $data): Payment
    {
        // El POS envía el monto en final_shares.amount_patient_clp
        if (!isset($data['amount_clp'])) {
            $data['amount_clp'] = data_get($data, 'final_shares.amount_patient_clp', 0);
        }

        return $this->processPayment($data);
    }

    /**
     * Procesa un pago (flujo general para manual/transferencia)
     */
    public function processPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            // Determinar el monto de forma robusta
            $amount_clp = $data['amount_clp'] 
                ?? $data['amount_total_clp'] 
                ?? data_get($data, 'final_shares.amount_patient_clp', 0);

            // 1. Crear el Registro de Pago
            $rawPatientId = $data['patient_id'] ?? null;
            $numericPatientId = null;

            if ($rawPatientId) {
                // Si viene con el prefijo person_X o company_X lo limpiamos
                $numericPatientId = (int) str_replace(['person_', 'company_'], '', (string)$rawPatientId);
            }

            $payment = Payment::create([
                'uuid' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'company_id' => $data['company_id'] ?? session('current_company_id'),
                'branch_id' => $data['branch_id'] ?? session('active_branch_id'),
                'patient_id' => $numericPatientId,
                'amount_clp' => $amount_clp,
                'payment_date' => $data['payment_date'] ?? now(),
                'payment_method' => $data['payment_details']['payment_method'] ?? $data['payment_method'],
                'transaction_reference' => $data['transaction_reference'] ?? null,
                'status' => 'completed',
                'paid_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // 2. Si vienen deudas (Invoices) a pagar
            if (!empty($data['invoice_ids'])) {
                $this->allocateToInvoices($payment, $data['invoice_ids']);
            }

            // 3. Si vienen sesiones individuales
            if (!empty($data['session_ids'])) {
                $this->allocateToSessions($payment, $data['session_ids']);
            }

            return $payment;
        });
    }

    /**
     * Asigna un pago a una o más facturas (Invoices)
     */
    public function allocateToInvoices(Payment $payment, array $invoiceIds): void
    {
        $remaining = $payment->amount_clp;

        $invoices = Invoice::whereIn('id', $invoiceIds)
            ->where('payment_status', '!=', 'paid')
            ->orderBy('date', 'asc')
            ->get();

        foreach ($invoices as $invoice) {
            if ($remaining <= 0) break;

            $pending = $invoice->total_amount_clp - $invoice->paid_amount_clp;
            $amountToPay = min($remaining, $pending);

            // Crear asignación
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'invoice_id' => $invoice->id,
                'amount_clp' => $amountToPay,
            ]);

            // Actualizar Invoice
            $invoice->increment('paid_amount_clp', $amountToPay);
            if ($invoice->paid_amount_clp >= $invoice->total_amount_clp) {
                $invoice->update(['payment_status' => 'paid']);
            }

            $remaining -= $amountToPay;
        }
    }

    /**
     * Asigna un pago a sesiones específicas
     */
    public function allocateToSessions(Payment $payment, array $sessionIds): void
    {
        $sessions = TreatmentSession::whereIn('id', $sessionIds)->get();

        foreach ($sessions as $session) {
            // Buscamos si tiene una factura asociada para marcarla como pagada si corresponde
            // (Opcional, dependiendo de si queremos que el flujo manual también afecte facturas)
            $invoice = $session->invoiceItems()->first()?->invoice;

            PaymentAllocation::create([
                'company_id' => $payment->company_id,
                'branch_id' => $payment->branch_id,
                'payment_id' => $payment->id,
                'treatment_session_id' => $session->id,
                'invoice_id' => $invoice?->id,
                'amount_clp' => $session->patient_amount_clp, // Asumimos pago total de la sesión
            ]);

            // Si hay factura, actualizamos su estado
            if ($invoice) {
                $invoice->increment('paid_amount_clp', $session->patient_amount_clp);
                if ($invoice->paid_amount_clp >= $invoice->total_amount_clp) {
                    $invoice->update(['payment_status' => 'paid']);
                } else {
                    $invoice->update(['payment_status' => 'partial']);
                }
            }
        }
    }

    /**
     * Inicia una transacción Webpay
     */
    public function initiateWebpayTransaction(array $data, ?string $returnUrl = null): array
    {
        $buyOrder = $this->generateBuyOrder($data['patient_id']);
        $sessionId = 'patient:' . $data['patient_id'];
        $amount_clp = (int) $data['amount_clp'];

        // Obtener datos de contexto si no vienen
        $companyId = $data['company_id'] ?? session('current_company_id');
        $branchId = $data['branch_id'] ?? session('current_branch_id');
        $userId = $data['user_id'] ?? auth()->id();

        // Crear registro de pago en estado pending
        $payment = Payment::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $userId,
            'company_id' => $companyId,
            'branch_id' => $branchId,
            'patient_id' => $data['patient_id'],
            'treatment_id' => $data['treatment_id'] ?? null,
            'treatment_session_id' => $data['treatment_session_id'] ?? null,
            'payment_date' => now(),
            'amount_clp' => $amount_clp,
            'payment_method' => 'webpay', 
            'status' => 'pending',
            'webpay_buy_order' => $buyOrder,
            'webpay_session_id' => $sessionId,
            'notes' => $data['notes'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        // Llamar a Webpay pasando la URL personalizada si existe
        $result = $this->webpay->createTransaction($buyOrder, $sessionId, $amount_clp, $returnUrl);

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
            // 1. Buscar el pago por token
            $payment = Payment::where('webpay_token', $token)->firstOrFail();

            // 2. Commit en Webpay (Retorna un Array desde WebpayPlusService)
            $result = $this->webpay->commit($token);

            $success = ($result['status'] ?? '') === 'AUTHORIZED' && ($result['response_code'] ?? -1) === 0;

            // 3. Actualizar registro del pago
            $payment->update([
                'status' => $success ? 'completed' : 'failed',
                'payment_method' => 'webpay',
                'paid_at' => $success ? now() : null,
                'webpay_authorization_code' => $result['authorization_code'] ?? null,
                'webpay_payment_type_code' => $result['payment_type_code'] ?? null,
                'webpay_response_code' => $result['response_code'] ?? null,
                'webpay_installments' => $result['installments_number'] ?? null,
                'webpay_card_detail' => $result['card_detail'] ?? null,
                'webpay_transaction_date' => $result['transaction_date'] ?? null,
                'webpay_raw_response' => $result,
            ]);

            // 4. LOG ESPECIAL PARA FORMULARIO DE CERTIFICACIÓN
            $this->logCertificationData($token, $result, $success);

            return $payment;
        });
    }

    /**
     * Genera log legible para el proceso de certificación de Transbank
     */
    private function logCertificationData(string $token, array $result, bool $success): void
    {
        $certLog = "\n" . str_repeat("=", 50) . "\n";
        $certLog .= "📝 DATOS PARA FORMULARIO DE CERTIFICACIÓN TRANSBANK\n";
        $certLog .= str_repeat("-", 50) . "\n";
        $certLog .= "Fecha/Hora:      " . now()->toDateTimeString() . "\n";
        $certLog .= "Estado Transbank: " . ($result['status'] ?? 'N/A') . "\n";
        $certLog .= "Resultado:       " . ($success ? '✅ EXITOSO (Aceptado)' : '❌ RECHAZADO / FALLIDO') . "\n";
        $certLog .= str_repeat("-", 50) . "\n";
        $certLog .= "1. Token:             " . $token . "\n";
        $certLog .= "2. Orden de Compra:   " . ($result['buy_order'] ?? 'N/A') . "\n";
        $certLog .= "3. ID Sesión:         " . ($result['session_id'] ?? 'N/A') . "\n";
        $certLog .= "4. Monto:             " . ($result['amount_clp'] ?? '0') . "\n";
        $certLog .= "5. Cód. Respuesta:    " . ($result['response_code'] ?? 'N/A') . " (0 = Éxito)\n";
        $certLog .= "6. Cód. Autorización: " . ($result['authorization_code'] ?? 'N/A') . "\n";
        $certLog .= "7. Tipo de Pago:      " . ($result['payment_type_code'] ?? 'N/A') . "\n";
        
        // VCI y AccountingDate vienen en el objeto 'raw' dentro del array $result
        $raw = $result['raw'] ?? null;
        $vci = $raw && method_exists($raw, 'getVci') ? $raw->getVci() : 'N/A';
        $accDate = $raw && method_exists($raw, 'getAccountingDate') ? $raw->getAccountingDate() : 'N/A';

        $certLog .= "8. VCI (Autenticación): " . $vci . "\n";
        $certLog .= "9. Fecha Contable:    " . $accDate . "\n";
        $certLog .= "10. Nro. Cuotas:       " . ($result['installments_number'] ?? '0') . "\n";
        $certLog .= "11. Tarjeta (Last 4):  " . ($result['card_detail']['card_number'] ?? '****') . "\n";
        $certLog .= "12. Fecha Transbank:  " . ($result['transaction_date'] ?? 'N/A') . "\n";
        $certLog .= str_repeat("=", 50) . "\n";

        Log::info($certLog);
        \Illuminate\Support\Facades\File::append(storage_path('logs/transbank_certification.log'), $certLog);
    }

    /**
     * Registra una transacción que fue abortada/cancelada por el usuario
     */
    public function logAbortedTransaction(?string $token, array $params): void
    {
        $certLog = "\n" . str_repeat("=", 50) . "\n";
        $certLog .= "📝 EVIDENCIA DE ANULACIÓN (ABORT) - CERTIFICACIÓN\n";
        $certLog .= str_repeat("-", 50) . "\n";
        $certLog .= "Fecha/Hora:      " . now()->toDateTimeString() . "\n";
        $certLog .= "Resultado:       ❌ CANCELADA POR USUARIO\n";
        $certLog .= str_repeat("-", 50) . "\n";
        $certLog .= "TBK_TOKEN:       " . ($token ?: 'N/A') . "\n";
        $certLog .= "Orden Compra:    " . ($params['TBK_ORDEN_COMPRA'] ?? 'N/A') . "\n";
        $certLog .= "ID Sesión:       " . ($params['TBK_ID_SESION'] ?? 'N/A') . "\n";
        $certLog .= "Acción:          El usuario presionó 'Anular' o el tiempo expiró.\n";
        $certLog .= str_repeat("=", 50) . "\n";

        Log::warning($certLog);
        \Illuminate\Support\Facades\File::append(storage_path('logs/transbank_certification.log'), $certLog);
    }

    /**
     * Genera un buy_order único
     */
    private function generateBuyOrder(int $patientId): string
    {
        return 'WP' . now()->format('YmdHis') . str_pad($patientId, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Procesa la compra de un plan para un paciente.
     */
    public function processPlanPurchase(int $patientId, int $planId, array $paymentDetails): Payment
    {
        return DB::transaction(function () use ($patientId, $planId, $paymentDetails) {
            $plan = \App\Models\Plan::findOrFail($planId);
            $patient = \App\Models\Patient::findOrFail($patientId);
            $companyId = $patient->company_id;

            // 1. Crear el Pago
            $payment = Payment::create([
                'company_id' => $companyId,
                'branch_id' => $paymentDetails['branch_id'],
                'user_id' => auth()->id(),
                'patient_id' => $patientId,
                'amount_gross_clp' => $plan->price,
                'amount_clp' => $plan->price,
                'payment_method' => $paymentDetails['payment_method'],
                'payment_date' => $paymentDetails['payment_date'] ?? now(),
                'transaction_reference' => $paymentDetails['transaction_reference'],
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            // 2. Activar el Plan (Suscribir al paciente)
            $patientPlan = \App\Models\PatientPlan::create([
                'company_id' => $companyId,
                'patient_id' => $patientId,
                'plan_id' => $planId,
                'payment_id' => $payment->id,
                'start_date' => now(),
                'end_date' => now()->addMonths($plan->valid_months ?? 12),
                'total_sessions' => $plan->total_sessions,
                'remaining_sessions' => $plan->total_sessions,
                'status' => 'active',
            ]);

            // 3. Generar la Factura (Invoice) vinculada al Plan
            $invoice = Invoice::create([
                'company_id' => $companyId,
                'branch_id' => $paymentDetails['branch_id'],
                'user_id' => auth()->id(),
                'patient_id' => $patientId,
                'entity_type' => 'Patient',
                'entity_id' => $patientId,
                'net_amount_clp' => 0,
                'exempt_amount_clp' => $plan->price,
                'vat_amount_clp' => 0,
                'total_amount_clp' => $plan->price,
                'amount_gross_clp' => $plan->price,
                'amount_patient_clp' => $plan->price,
                'issue_date' => now(),
                'dte_type' => Invoice::TYPE_BOLETA_EXENTA,
                'dte_status' => DteStatusEnum::PENDING,
                'payment_status' => FinanceStatusEnum::PAID,
            ]);

            // 4. Crear el ítem de la factura
            $invoice->items()->create([
                'company_id' => $companyId,
                'branch_id' => $paymentDetails['branch_id'],
                'sellable_type' => 'App\Models\Plan',
                'sellable_id' => $planId,
                'description' => "Compra de Plan: " . $plan->name,
                'quantity' => 1,
                'unit_price_clp' => $plan->price,
                'unit_patient_clp' => $plan->price,
                'total_gross_clp' => $plan->price,
                'total_patient_clp' => $plan->price,
                'is_exento' => true,
            ]);

            // 5. Vincular Pago con Factura
            $payment->paymentAllocations()->create([
                'company_id' => $companyId,
                'invoice_id' => $invoice->id,
                'amount_clp' => $plan->price,
            ]);

            Log::info("Plan {$plan->name} adquirido exitosamente por paciente {$patientId}. Pago ID: {$payment->id}");

            return $payment;
        });
    }

    /**
     * Asigna un pago a un plan específico
     */
    public function allocateToPlan(Payment $payment, int $planId): void
    {
        // Lógica para asignar a plan (por implementar)
    }

    /**
     * Crea una factura pendiente (deuda) para una sesión de tratamiento.
     */
    public function createPendingInvoiceForSession(TreatmentSession $session): Invoice
    {
        return DB::transaction(function () use ($session) {
            $branchId = $session->branch_id ?? session('active_branch_id');
            
            if (!$branchId) {
                // Si aún es nulo, buscamos la primera sucursal de la empresa como último recurso
                $branchId = \App\Models\Branch::where('company_id', $session->company_id)->first()?->id;
            }

            // 1. Crear el Encabezado de la Factura (Pendiente)
            $invoice = Invoice::create([
                'company_id' => $session->company_id,
                'branch_id' => $branchId,
                'user_id' => auth()->id() ?? $session->user_id,
                'patient_id' => $session->patient_id,
                'entity_type' => 'Patient',
                'entity_id' => $session->patient_id,
                
                // Montos
                'net_amount_clp' => 0,
                'exempt_amount_clp' => (int)$session->patient_amount_clp,
                'vat_amount_clp' => 0,
                'total_amount_clp' => (int)$session->patient_amount_clp,
                
                'amount_gross_clp' => (int)$session->patient_amount_clp,
                'amount_patient_clp' => (int)$session->patient_amount_clp,
                
                'issue_date' => now(),
                'dte_type' => Invoice::TYPE_BOLETA_EXENTA, // Por defecto para salud exento (41)
                'dte_status' => \App\Enums\DteStatusEnum::PENDING,
                'payment_status' => \App\Enums\FinanceStatusEnum::UNPAID,
            ]);

            // 2. Crear el ítem vinculado
            $invoice->items()->create([
                'company_id' => $session->company_id,
                'branch_id' => $branchId,
                'sellable_type' => 'App\Models\Item',
                'sellable_id' => $session->item_id,
                'treatment_session_id' => $session->id,
                'description' => $session->item?->name ?? 'Sesión Médica',
                'quantity' => 1,
                'unit_price_clp' => (int)$session->patient_amount_clp,
                'unit_patient_clp' => (int)$session->patient_amount_clp,
                'total_gross_clp' => (int)$session->patient_amount_clp,
                'total_patient_clp' => (int)$session->patient_amount_clp,
                'is_exento' => true,
            ]);

            Log::info("Deuda (Invoice Unpaid) creada para sesión {$session->id}, monto: {$session->patient_amount_clp}");

            return $invoice;
        });
    }
}
