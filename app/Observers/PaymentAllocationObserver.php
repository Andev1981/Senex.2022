<?php

namespace App\Observers;

use App\Models\Debt;
use App\Models\PaymentAllocation;

class PaymentAllocationObserver
{
  public function created(PaymentAllocation $alloc): void
  {
    $this->syncDebt($alloc);
  }
  public function updated(PaymentAllocation $alloc): void
  {
    $this->syncDebt($alloc);
  }
  public function deleted(PaymentAllocation $alloc): void
  {
    $this->syncDebt($alloc);
  }

  protected function syncDebt(PaymentAllocation $alloc): void
  {
    $debt = Debt::query()->find($alloc->debt_id);
    if (!$debt) return;

    // Recalcular pagado desde allocations (si usas ambos, tomamos el máximo)
    $allocPaid = (float) $debt->paymentAllocations()->sum('amount_clp');
    $debt->paid_amount = max((float)$debt->paid_amount, $allocPaid);

    // Refrescar estado según tu lógica del modelo
    $debt->refreshStatus(); // guarda adentro
  }
}
