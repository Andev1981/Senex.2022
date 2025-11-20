<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class PaymentAllocation extends Model
{


  protected $fillable = [
    'payment_id',
    'treatment_session_id',
    'debt_id',
    'invoice_id',
    'amount',
  ];


  // ===== Relaciones =====
  public function payment()
  {
    return $this->belongsTo(Payment::class);
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
