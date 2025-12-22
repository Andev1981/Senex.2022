<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAllocation extends Model
{
  use Multitenantable;

  protected $fillable = [
    'company_id',
    'payment_id',
    'treatment_session_id',
    'debt_id',
    'invoice_id',
    'amount_clp',
  ];


  // ===== Relaciones =====

  public function treatmentSession() :BelongsTo
  {
    return $this->belongsTo(TreatmentSession::class);
  }

  public function payment() : BelongsTo
  {
    return $this->belongsTo(Payment::class);
  }

  public function debt() : BelongsTo
  {
    return $this->belongsTo(Debt::class);
  }

  public function invoice() : BelongsTo
  {
    return $this->belongsTo(Invoice::class);
  }

}
