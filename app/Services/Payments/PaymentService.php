<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\Debt;
use App\Models\TreatmentSession;
use App\Models\Voucher;
use App\Models\Invoice;
use App\Models\PatientPlan;
use App\Services\Dte\DteService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        private WebpayPlusService $webpay,
        private ?DteService $dteService = null
    ) {}

    /**
     * Procesa un pago completo con múltiples opciones
     * 
     * @param array $data Datos del pago
     * @return Payment
     */
    public function processPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            // Crear el pago principal
            $payment = $this->createPayment($data);

            // Aplicar voucher si existe
            if (!empty($data['voucher_id'])) {
                $this->applyVoucher($payment, $data['voucher_id'], $data['voucher_amount'] ?? null);
            }

            // Asignar a sesiones/deudas
            if (!empty($data['session_ids'])) {
                $this->allocateToSessions($payment, $data['session_ids']);
            }

            if (!empty($data['debt_ids'])) {
                $this->allocateToDebts($payment, $data['debt_ids']);
            }

            // Emitir DTE si está configurado
            /* if ($data['auto_issue_dte'] ?? false) {
                $this->issueDte($payment, $data['dte_type'] ?? 39);
            } */

            return $payment->fresh(['allocations', 'invoice']);
        });
    }

    /**
     * Crea el registro de pago
     */
    private function createPayment(array $data): Payment
    {
        return Payment::create([
            'patient_id' => $data['patient_id'],
            'treatment_id' => $data['treatment_id'] ?? null,
            'treatment_session_id' => $data['treatment_session_id'] ?? null,
            'payment_date' => $data['payment_date'] ?? now(),
            'transaction_reference' => $data['transaction_reference'] ?? null,
            'amount_clp' => $data['amount'],
            'copay_clp' => $data['copay_clp'] ?? 0,
            'insurance_covered_clp' => $data['insurance_covered_clp'] ?? 0,
            'payment_method' => $data['payment_method'],
            'status' => $data['status'] ?? 'completed',
            'paid_at' => $data['paid_at'] ?? now(),
            'notes' => $data['notes'] ?? null,
            
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
     * Aplica un voucher al pago
     */
    private function applyVoucher(Payment $payment, int $voucherId, ?int $amount = null): void
    {
        $voucher = Voucher::findOrFail($voucherId);

        if (!$voucher->isAvailable()) {
            throw new \Exception('El voucher no está disponible para uso');
        }

        // Determinar monto a usar del voucher
        $voucherAmount = $amount ?? min($voucher->current_balance, $payment->amount_clp);

        // Usar el voucher
        $voucher->useForPayment(
            $voucherAmount,
            $payment->id,
            $payment->treatment_session_id
        );

        // Registrar en notas del pago
        $payment->update([
            'notes' => ($payment->notes ? $payment->notes . "\n" : '') . 
                       "Voucher {$voucher->code} aplicado: " . number_format($voucherAmount, 0, ',', '.') . " CLP"
        ]);
    }

    /**
     * Asigna el pago a sesiones específicas
     */
    /* private function allocateToSessions(Payment $payment, array $sessionIds): void
    {
        foreach ($sessionIds as $sessionId) {
            $session = TreatmentSession::findOrFail($sessionId);
            
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'treatment_session_id' => $sessionId,
                'debt_id' => $session->debt_id,
                'amount' => $session->patient_amount,
            ]);

            // Actualizar deuda si existe
            if ($session->debt) {
                $this->updateDebtStatus($session->debt);
            }
        }
    } */

    /**
     * Asigna el pago a deudas específicas
     */
   /*  private function allocateToDebts(Payment $payment, array $debtIds): void
    {
        foreach ($debtIds as $debtId) {
            $debt = Debt::findOrFail($debtId);
            
            $remainingDebt = $debt->original_amount - $debt->paid_amount;
            $allocationAmount = min($remainingDebt, $payment->amount_clp);

            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'debt_id' => $debtId,
                'amount' => $allocationAmount,
            ]);

            $this->updateDebtStatus($debt);
        }
    } */

    /**
     * Actualiza el estado de una deuda
     */
    private function updateDebtStatus(Debt $debt): void
    {
        $totalPaid = $debt->allocations()->sum('amount');
        
        $debt->update([
            'paid_amount' => $totalPaid,
            'status' => $this->calculateDebtStatus($debt->original_amount, $totalPaid, $debt->due_date),
        ]);
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
     * Emite DTE para el pago
     */
    /* private function issueDte(Payment $payment, int $dteType): void
    {
        if (!$this->dteService) {
            Log::warning('DTE Service no disponible');
            return;
        }

        try {
            $invoice = $this->dteService->issueForPayment($payment, $dteType);
            
            $payment->update(['invoice' => $invoice->folio]);
            
        } catch (\Exception $e) {
            Log::error('Error al emitir DTE', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            
            // No fallar el pago si falla el DTE
            $payment->update([
                'notes' => ($payment->notes ? $payment->notes . "\n" : '') . 
                           "Error al emitir DTE: " . $e->getMessage()
            ]);
        }
    } */

    /**
     * Inicia una transacción Webpay
     */
    public function initiateWebpayTransaction(array $data): array
    {
        $buyOrder = $this->generateBuyOrder($data['patient_id']);
        $sessionId = 'patient:' . $data['patient_id'];
        $amount = $data['amount'];

        // Crear registro de pago en estado pending
        $payment = Payment::create([
            'patient_id' => $data['patient_id'],
            'treatment_id' => $data['treatment_id'] ?? null,
            'treatment_session_id' => $data['treatment_session_id'] ?? null,
            'payment_date' => now(),
            'amount_clp' => $amount,
            'payment_method' => 'webpay_credit', // Se actualizará después
            'status' => 'pending',
            'webpay_buy_order' => $buyOrder,
            'webpay_session_id' => $sessionId,
            'notes' => $data['notes'] ?? null,
        ]);


        // Llamar a Webpay
        $result = $this->webpay->create($buyOrder, $sessionId, $amount);

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
        return match($code) {
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
 * Asigna un pago a múltiples sesiones
 */
public function allocateToSessions(Payment $payment, array $sessionIds): void
{
    DB::transaction(function () use ($payment, $sessionIds) {
        foreach ($sessionIds as $sessionId) {
            $session = TreatmentSession::findOrFail($sessionId);
            
            // Crear asignación
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'treatment_session_id' => $session->id,
                'amount_clp' => $session->patient_amount,
            ]);
            
            // Actualizar sesión como pagada
            $session->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
        }
        
        Log::info('Payment allocated to sessions', [
            'payment_id' => $payment->id,
            'session_ids' => $sessionIds,
        ]);
    });
}

/**
 * Asigna un pago a deudas pendientes
 */
public function allocateToDebts(Payment $payment, array $debtIds, bool $isPartial = false): void
{
    DB::transaction(function () use ($payment, $debtIds, $isPartial) {
        $remainingAmount = $payment->amount_clp;
        
        foreach ($debtIds as $debtId) {
            if ($remainingAmount <= 0) break;
            
            $debt = Debt::findOrFail($debtId);
            $amountToAllocate = min($remainingAmount, $debt->remaining_amount);
            
            // Crear asignación
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'debt_id' => $debt->id,
                'amount_clp' => $amountToAllocate,
            ]);
            
            // Actualizar deuda
            $debt->remaining_amount -= $amountToAllocate;
            if ($debt->remaining_amount <= 0) {
                $debt->status = 'paid';
                $debt->paid_at = now();
            }
            $debt->save();
            
            $remainingAmount -= $amountToAllocate;
        }
        
        Log::info('Payment allocated to debts', [
            'payment_id' => $payment->id,
            'debt_ids' => $debtIds,
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
}
