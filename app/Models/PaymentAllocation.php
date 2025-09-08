<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class PaymentAllocation extends Model
{


  protected $fillable = [
    'tenant_id',
    'payment_transaction_id',
    'debt_id',
    'invoice_id',
    'amount',
  ];

  protected $casts = [
    'amount' => 'decimal:2',
  ];

  // ===== Relaciones =====
  public function payment()
  {
    return $this->belongsTo(PaymentTransaction::class, 'payment_transaction_id');
  }

  public function debt()
  {
    return $this->belongsTo(Debt::class);
  }

  public function invoice()
  {
    return $this->belongsTo(Invoice::class);
  }
}
