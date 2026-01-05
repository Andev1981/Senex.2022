<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Payroll extends Model
{

  use Multitenantable;

  public const STATUS_DRAFT    = 'draft';
  public const STATUS_APPROVED = 'approved';
  public const STATUS_PAID     = 'paid';

  protected $fillable = [
    'company_id',
    'doctor_id',
    'period_start',
    'period_end',
    'total_sessions',
    'total_patient_amount_clp',
    'total_commission_amount_clp',
    'total_adjustments_clp',
    'total_payable_clp',
    'status',
    'paid_at',
    'notes',
  ];

  protected $casts = [
    'period_start'         => 'date',
    'period_end'           => 'date',
    'total_patient_amount_clp' => 'decimal:2',
    'total_commission_amount_clp'  => 'decimal:2',
    'total_adjustments_clp'  => 'decimal:2',
    'total_payable_clp'  => 'decimal:2',
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
    $this->total_patient_amount_clp = (float) $this->details()->sum('patient_amount_clp');
    $this->total_commission_amount_clp  = (float) $this->details()->sum('commission_amount_clp');
    $this->total_adjustments_clp  = (float) $this->details()->sum('adjustment_amount_clp');
    $this->total_payable_clp  = (float) ($this->total_patient_amount_clp - $this->total_commission_amount_clp - $this->total_adjustments_clp);
    $this->save();
  }
}
