<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Payroll extends Model
{


  public const STATUS_DRAFT    = 'draft';
  public const STATUS_APPROVED = 'approved';
  public const STATUS_PAID     = 'paid';

  protected $fillable = [
    'doctor_id',
    'period_start',
    'period_end',
    'total_sessions',
    'total_patient_amount',
    'total_doctor_amount',
    'total_clinic_amount',
    'status',
    'paid_at',
    'notes',
  ];

  protected $casts = [
    'period_start'         => 'date',
    'period_end'           => 'date',
    'total_patient_amount' => 'decimal:2',
    'total_doctor_amount'  => 'decimal:2',
    'total_clinic_amount'  => 'decimal:2',
    'paid_at'              => 'datetime',
  ];

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function details(): HasMany
  {
    return $this->hasMany(PayrollDetail::class);
  }

  // Helpers
  public function markApproved(): void
  {
    $this->status = self::STATUS_APPROVED;
    $this->save();
  }

  public function markPaid(): void
  {
    $this->status = self::STATUS_PAID;
    $this->paid_at = now();
    $this->save();
  }

  public function recalcTotals(): void
  {
    $this->total_sessions       = (int) $this->details()->count();
    $this->total_patient_amount = (float) $this->details()->sum('patient_amount');
    $this->total_doctor_amount  = (float) $this->details()->sum('doctor_amount_clp');
    $this->total_clinic_amount  = (float) ($this->total_patient_amount - $this->total_doctor_amount);
    $this->save();
  }
}
