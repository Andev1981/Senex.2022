<?php

namespace App\Services\Vouchers;

use App\Models\Voucher;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VoucherService
{
    /**
     * Crea un nuevo voucher
     */
    public function createVoucher(array $data): Voucher
    {
        return DB::transaction(function () use ($data) {
            // Generar código si no se proporciona
            if (empty($data['code'])) {
                $prefix = $data['source'] === 'imed' ? 'IMED' : 'VOUCHER';
                $data['code'] = Voucher::generateCode($prefix);
            }

            // Calcular saldos iniciales según tipo
            $initialBalance = match($data['type']) {
                'monetary' => $data['monetary_value'],
                'sessions' => 0, // Las sesiones no tienen valor monetario directo
                'treatment' => $data['monetary_value'] ?? 0,
                'percentage' => 0,
                default => 0,
            };

            $voucher = Voucher::create([
                'code' => $data['code'],
                'patient_id' => $data['patient_id'] ?? null,
                'type' => $data['type'],
                'monetary_value' => $data['monetary_value'] ?? 0,
                'sessions_quantity' => $data['sessions_quantity'] ?? 0,
                'sessions_remaining' => $data['sessions_quantity'] ?? 0,
                'discount_percentage' => $data['discount_percentage'] ?? 0,
                'initial_balance' => $initialBalance,
                'current_balance' => $initialBalance,
                'used_balance' => 0,
                'status' => $data['status'] ?? 'pending_activation',
                'issued_date' => $data['issued_date'] ?? now(),
                'activation_date' => $data['activation_date'] ?? null,
                'expiration_date' => $data['expiration_date'] ?? null,
                'allowed_treatments' => $data['allowed_treatments'] ?? null,
                'allowed_session_types' => $data['allowed_session_types'] ?? null,
                'is_transferable' => $data['is_transferable'] ?? false,
                'source' => $data['source'] ?? 'internal',
                'external_id' => $data['external_id'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            // Auto-activar si se especifica
            if ($data['auto_activate'] ?? false) {
                $voucher->activate();
            }

            return $voucher;
        });
    }

    /**
     * Crea un voucher de sesiones prepagadas
     */
    public function createSessionsVoucher(
        int $patientId,
        int $sessionsQuantity,
        ?int $treatmentId = null,
        ?Carbon $expirationDate = null,
        ?int $createdBy = null
    ): Voucher {
        return $this->createVoucher([
            'patient_id' => $patientId,
            'type' => 'sessions',
            'sessions_quantity' => $sessionsQuantity,
            'allowed_treatments' => $treatmentId ? [$treatmentId] : null,
            'expiration_date' => $expirationDate,
            'is_transferable' => false,
            'source' => 'internal',
            'created_by' => $createdBy ?? auth()->id(),
            'auto_activate' => true,
        ]);
    }

    /**
     * Crea un voucher monetario
     */
    public function createMonetaryVoucher(
        int $amount,
        ?int $patientId = null,
        ?Carbon $expirationDate = null,
        bool $isTransferable = false,
        ?int $createdBy = null
    ): Voucher {
        return $this->createVoucher([
            'patient_id' => $patientId,
            'type' => 'monetary',
            'monetary_value' => $amount,
            'expiration_date' => $expirationDate,
            'is_transferable' => $isTransferable,
            'source' => 'internal',
            'created_by' => $createdBy ?? auth()->id(),
            'auto_activate' => true,
        ]);
    }

    /**
     * Crea un voucher desde IMED
     */
    public function createImedVoucher(array $imedData): Voucher
    {
        return $this->createVoucher([
            'code' => $imedData['code'],
            'patient_id' => $imedData['patient_id'] ?? null,
            'type' => $imedData['type'] ?? 'monetary',
            'monetary_value' => $imedData['amount'] ?? 0,
            'sessions_quantity' => $imedData['sessions'] ?? 0,
            'expiration_date' => isset($imedData['expiration_date']) 
                ? Carbon::parse($imedData['expiration_date']) 
                : null,
            'source' => 'imed',
            'external_id' => $imedData['imed_id'] ?? null,
            'metadata' => $imedData,
            'is_transferable' => $imedData['is_transferable'] ?? false,
            'status' => 'pending_activation',
        ]);
    }

    /**
     * Obtiene los vouchers disponibles para un paciente
     */
    public function getAvailableVouchersForPatient(int $patientId): \Illuminate\Database\Eloquent\Collection
    {
        return Voucher::where('patient_id', $patientId)
            ->active()
            ->withBalance()
            ->orderBy('expiration_date', 'asc')
            ->get()
            ->filter(fn($voucher) => $voucher->isAvailable());
    }

    /**
     * Obtiene el mejor voucher para aplicar a un pago
     */
    public function getBestVoucherForPayment(
        int $patientId,
        int $amount,
        ?int $treatmentId = null,
        ?int $sessionTypeId = null
    ): ?Voucher {
        $vouchers = $this->getAvailableVouchersForPatient($patientId);

        // Filtrar por restricciones de tratamiento/tipo de sesión
        $applicableVouchers = $vouchers->filter(function ($voucher) use ($treatmentId, $sessionTypeId) {
            return $voucher->availableAmountFor($treatmentId, $sessionTypeId) > 0;
        });

        if ($applicableVouchers->isEmpty()) {
            return null;
        }

        // Priorizar: 1) Los que expiran primero, 2) Los que más cubren el monto
        return $applicableVouchers->sortBy([
            fn($a, $b) => ($a->expiration_date ?? Carbon::maxValue()) <=> ($b->expiration_date ?? Carbon::maxValue()),
            fn($a, $b) => $b->current_balance <=> $a->current_balance,
        ])->first();
    }

    /**
     * Aplica el mejor voucher disponible a un pago
     */
    public function applyBestVoucher(
        int $patientId,
        int $paymentAmount,
        ?int $treatmentId = null,
        ?int $sessionTypeId = null,
        ?int $paymentId = null,
        ?int $sessionId = null
    ): ?array {
        $voucher = $this->getBestVoucherForPayment($patientId, $paymentAmount, $treatmentId, $sessionTypeId);

        if (!$voucher) {
            return null;
        }

        $voucherAmount = min($voucher->current_balance, $paymentAmount);

        $success = $voucher->useForPayment($voucherAmount, $paymentId, $sessionId);

        return $success ? [
            'voucher_id' => $voucher->id,
            'voucher_code' => $voucher->code,
            'amount_used' => $voucherAmount,
            'remaining_balance' => $voucher->fresh()->current_balance,
        ] : null;
    }

    /**
     * Procesa expiración de vouchers
     */
    public function expireOldVouchers(): int
    {
        $expiredVouchers = Voucher::expired()->get();
        
        $count = 0;
        foreach ($expiredVouchers as $voucher) {
            if ($voucher->markAsExpired()) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Obtiene estadísticas de vouchers
     */
    public function getStatistics(): array
    {
        return [
            'total_active' => Voucher::active()->count(),
            'total_expired' => Voucher::where('status', 'expired')->count(),
            'total_fully_used' => Voucher::where('status', 'fully_used')->count(),
            'total_balance' => Voucher::active()->sum('current_balance'),
            'total_sessions_remaining' => Voucher::where('type', 'sessions')
                ->active()
                ->sum('sessions_remaining'),
            'by_source' => Voucher::select('source', DB::raw('count(*) as total'))
                ->groupBy('source')
                ->pluck('total', 'source')
                ->toArray(),
            'by_type' => Voucher::select('type', DB::raw('count(*) as total'))
                ->groupBy('type')
                ->pluck('total', 'type')
                ->toArray(),
        ];
    }

    /**
     * Valida un código de voucher
     */
    public function validateVoucherCode(string $code): ?Voucher
    {
        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) {
            return null;
        }

        return $voucher->isAvailable() ? $voucher : null;
    }

    /**
     * Transfiere un voucher a otro paciente
     */
    public function transferVoucher(int $voucherId, int $newPatientId, int $userId): bool
    {
        $voucher = Voucher::findOrFail($voucherId);
        
        $patient = Patient::findOrFail($newPatientId);
        
        return $voucher->transferTo($newPatientId, $userId);
    }

    /**
     * Cancela un voucher
     */
    public function cancelVoucher(int $voucherId, string $reason, int $userId): bool
    {
        return DB::transaction(function () use ($voucherId, $reason, $userId) {
            $voucher = Voucher::findOrFail($voucherId);

            if (!in_array($voucher->status, ['active', 'partially_used', 'pending_activation'])) {
                return false;
            }

            $voucher->update(['status' => 'cancelled']);

            $voucher->transactions()->create([
                'transaction_type' => 'cancellation',
                'amount' => 0,
                'balance_before' => $voucher->current_balance,
                'balance_after' => $voucher->current_balance,
                'processed_by' => $userId,
                'description' => "Voucher cancelado: {$reason}",
            ]);

            return true;
        });
    }
}
