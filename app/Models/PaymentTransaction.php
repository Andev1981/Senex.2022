<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class PaymentTransaction extends Model
{


  public const METHOD_WEBPAY   = 'webpay';
  public const METHOD_CASH     = 'cash';
  public const METHOD_TRANSFER = 'transfer';
  public const METHOD_INSURANCE = 'insurance';

  public const STATUS_PENDING   = 'pending';
  public const STATUS_COMPLETED = 'completed';
  public const STATUS_FAILED    = 'failed';
  public const STATUS_REFUNDED  = 'refunded';

  protected $fillable = [
    'tenant_id',
    'patient_id',
    'treatment_session_id',
    'amount',
    'payment_method',
    'status',
    'paid_at',
    'currency',
    'provider_txn_id',
    'provider_payload',
    'notes',
  ];

  protected $casts = [
    'amount'          => 'decimal:2',
    'paid_at'         => 'datetime',
    'provider_payload' => 'array',
  ];

  // ===== Relaciones =====
  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }

  public function allocations()
  {
    return $this->hasMany(PaymentAllocation::class);
  }

  // ===== Scopes =====
  public function scopeCompleted($q)
  {
    return $q->where('status', self::STATUS_COMPLETED);
  }

  // ===== Helpers =====
  public function getAllocatedAmountAttribute(): float
  {
    return (float) $this->allocations()->sum('amount');
  }

  public function getUnallocatedAmountAttribute(): float
  {
    return max(0, (float)$this->amount - (float)$this->allocated_amount);
  }

  public function isSettled(): bool
  {
    return $this->status === self::STATUS_COMPLETED && $this->unallocated_amount <= 0.0001;
  }
}
