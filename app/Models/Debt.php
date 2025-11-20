<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Debt extends Model
{


  public const STATUS_PENDING = 'pending';
  public const STATUS_PARTIAL = 'partial';
  public const STATUS_PAID    = 'paid';
  public const STATUS_OVERDUE = 'overdue';

  protected $fillable = [
    'patient_id',
    'treatment_session_id',
    'original_amount',
    'paid_amount',
    'status',
    'due_date',
    'payment_reminders_sent',
  ];

  protected $casts = [
    'due_date'        => 'date',
  ];


  // ===== Relaciones =====
  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }

  public function paymentAllocations()
  {
    return $this->hasMany(PaymentAllocation::class, 'debt_id');
  }

  // ===== Accessors =====
  public function getBalanceAttribute(): float
  {
    $paid = (float)$this->paid_amount;
    // si usas allocations a deuda, puedes sumarlas aquí:
    $allocPaid = (float) $this->paymentAllocations()->sum('amount');
    $paid = max($paid, $allocPaid); // por si migraste de un modelo a otro
    return max(0, (float)$this->original_amount - $paid);
  }

  public function isPaid(): bool
  {
    return $this->balance <= 0.0001;
  }
  public function isOverdue(): bool
  {
    return $this->balance > 0.0001 && $this->due_date && now()->isAfter($this->due_date);
  }

  // ===== Hooks de estado (útiles en servicios al registrar pago) =====
  public function refreshStatus(): void
  {
    if ($this->balance <= 0.0001) {
      $this->status = self::STATUS_PAID;
    } elseif ($this->paid_amount > 0) {
      $this->status = self::STATUS_PARTIAL;
    } else {
      $this->status = $this->isOverdue() ? self::STATUS_OVERDUE : self::STATUS_PENDING;
    }
    $this->save();
  }

  public function scopeOpen($q)
  {
    return $q->whereIn('debts.status', [self::STATUS_PENDING, self::STATUS_PARTIAL, self::STATUS_OVERDUE]);
  }

  protected $appends = ['remaining_amount'];

  public function getRemainingAmountAttribute(): float
  {
      return max(0, $this->original_amount - $this->paid_amount);
  }
}
