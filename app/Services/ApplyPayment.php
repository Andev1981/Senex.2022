<?php

namespace App\Services\Payments;

use App\Models\Debt;
use App\Models\PaymentAllocation;
use Illuminate\Support\Facades\DB;

class ApplyPayment
{
  /**
   * @param int $patientId
   * @param float $amount
   * @param array<int> $debtIds en orden de prioridad
   */
  public function handle(int $patientId, float $amount, array $debtIds): void
  {
    DB::transaction(function () use ($patientId, $amount, $debtIds) {
      foreach ($debtIds as $debtId) {
        if ($amount <= 0) break;

        /** @var Debt $debt */
        $debt = Debt::query()
          ->whereHas('treatmentSession', fn($q) => $q->where('patient_id', $patientId))
          ->findOrFail($debtId);

        $balance = $debt->balance; // usa accessor del modelo
        if ($balance <= 0) continue;

        $alloc = min($balance, $amount);

        PaymentAllocation::create([
          'debt_id' => $debt->id,
          'amount'  => $alloc,
        ]);

        // El observer se encarga de sincronizar paid_amount + status
        $amount -= $alloc;
      }
    });
  }
}
