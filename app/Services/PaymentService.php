<?php
// app/Services/PaymentService.php

namespace App\Services;

use App\Models\Payment;
use App\Models\Debt;
use App\Models\PaymentAllocation;
use App\Models\TreatmentSession;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PaymentService
{
   public function __construct(
        private PlanService $planService
    ) {}


    /**
     * Generar deuda automáticamente al crear una sesión
     */
    public function createDebtForSession(TreatmentSession $session, ?int $customAmount = null): Debt
    {
        return DB::transaction(function () use ($session, $customAmount) {
            // Determinar monto de la deuda
            $amount = $customAmount ?? $this->calculateSessionAmount($session);

            $debt = Debt::create([
                'patient_id' => $session->patient_id,
                'treatment_session_id' => $session->id,
                'original_amount' => $amount,
                'paid_amount' => 0,
                'status' => 'pending',
                'due_date' => Carbon::parse($session->date)->addDays(7), // 7 días después de la sesión
            ]);

            Log::info('Deuda creada para sesión', [
                'debt_id' => $debt->id,
                'session_id' => $session->id,
                'amount' => $amount,
            ]);

            return $debt;
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

            // Si se especificaron deudas específicas
            if (isset($data['debt_ids']) && is_array($data['debt_ids'])) {
                $this->allocatePaymentToDebts($payment, $data['debt_ids']);
            }

            Log::info('Pago registrado', [
                'payment_id' => $payment->id,
                'patient_id' => $payment->patient_id,
                'amount' => $payment->amount_clp,
            ]);

            return $payment->fresh();
        });
    }

    /**
     * Asignar pago automáticamente a deudas pendientes (FIFO)
     */
    private function autoAllocatePayment(Payment $payment): void
    {
        // Obtener deudas pendientes del paciente, ordenadas por antigüedad
        $pendingDebts = Debt::where('patient_id', $payment->patient_id)
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->orderBy('due_date')
            ->get();

        $remainingAmount = $payment->amount_clp;

        foreach ($pendingDebts as $debt) {
            if ($remainingAmount <= 0) break;

            $debtBalance = $debt->original_amount - $debt->paid_amount;

            if ($debtBalance <= 0) continue;

            // Cuánto asignar a esta deuda
            $amountToAllocate = min($remainingAmount, $debtBalance);

            // Crear la asignación
            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'debt_id' => $debt->id,
                'amount' => $amountToAllocate,
            ]);

            // Actualizar deuda
            $debt->paid_amount += $amountToAllocate;
            
            if ($debt->paid_amount >= $debt->original_amount) {
                $debt->status = 'paid';
            } elseif ($debt->paid_amount > 0) {
                $debt->status = 'partial';
            }
            
            $debt->save();

            $remainingAmount -= $amountToAllocate;

            Log::info('Pago asignado a deuda', [
                'payment_id' => $payment->id,
                'debt_id' => $debt->id,
                'amount' => $amountToAllocate,
            ]);
        }

        // Si sobró dinero, podría ser crédito a favor o error
        if ($remainingAmount > 0) {
            Log::warning('Pago excede deudas pendientes', [
                'payment_id' => $payment->id,
                'remaining_amount' => $remainingAmount,
            ]);
        }
    }

    /**
     * Asignar pago a deudas específicas
     */
    public function allocatePaymentToDebts(Payment $payment, array $debtIds): void
    {
        $debts = Debt::whereIn('id', $debtIds)
            ->where('patient_id', $payment->patient_id)
            ->get();

        $remainingAmount = $payment->amount_clp;

        // Verificar que ya no esté asignado
        $alreadyAllocated = PaymentAllocation::where('payment_id', $payment->id)->sum('amount');
        $remainingAmount -= $alreadyAllocated;

        foreach ($debts as $debt) {
            if ($remainingAmount <= 0) break;

            $debtBalance = $debt->original_amount - $debt->paid_amount;
            $amountToAllocate = min($remainingAmount, $debtBalance);

            PaymentAllocation::create([
                'payment_id' => $payment->id,
                'debt_id' => $debt->id,
                'amount' => $amountToAllocate,
            ]);

            $debt->paid_amount += $amountToAllocate;
            
            if ($debt->paid_amount >= $debt->original_amount) {
                $debt->status = 'paid';
            } elseif ($debt->paid_amount > 0) {
                $debt->status = 'partial';
            }
            
            $debt->save();

            $remainingAmount -= $amountToAllocate;
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
     * Marcar deudas vencidas como overdue
     */
    public function markOverdueDebts(): int
    {
        $count = Debt::whereIn('status', ['pending', 'partial'])
            ->where('due_date', '<', now())
            ->update(['status' => 'overdue']);

        Log::info('Deudas marcadas como vencidas', ['count' => $count]);

        return $count;
    }

    /**
     * Obtener resumen financiero del paciente
     */
    public function getPatientFinancialSummary(int $patientId): array
    {
        $debts = Debt::where('patient_id', $patientId)->get();
        $payments = Payment::where('patient_id', $patientId)
            ->where('status', 'completed')
            ->get();

        $totalDebt = $debts->sum('original_amount');
        $totalPaid = $debts->sum('paid_amount');
        $pendingBalance = $totalDebt - $totalPaid;

        return [
            'total_debt' => $totalDebt,
            'total_paid' => $totalPaid,
            'pending_balance' => $pendingBalance,
            'overdue_debts' => $debts->where('status', 'overdue')->count(),
            'payment_history' => $payments->map(function ($p) {
                return [
                    'date' => $p->date,
                    'amount' => $p->amount_clp,
                    'method' => $p->payment_method,
                    'invoice' => $p->invoice,
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

            // Revertir asignaciones a deudas
            $allocations = PaymentAllocation::where('payment_id', $payment->id)->get();

            foreach ($allocations as $allocation) {
                $debt = $allocation->debt;
                $debt->paid_amount -= $allocation->amount;

                // Actualizar estado de la deuda
                if ($debt->paid_amount <= 0) {
                    $debt->status = 'pending';
                } elseif ($debt->paid_amount < $debt->original_amount) {
                    $debt->status = 'partial';
                }

                $debt->save();
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