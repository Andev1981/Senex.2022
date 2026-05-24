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
    'total_patient_amount_clp' => 'integer',
    'total_commission_amount_clp'  => 'integer',
    'total_adjustments_clp'  => 'integer',
    'total_payable_clp'  => 'integer',
    'paid_at'              => 'datetime',
  ];

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function company()
  {
    return $this->belongsTo(Company::class);
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
    $this->total_sessions = (int) $this->details()->count();
    $this->total_patient_amount_clp = (int) $this->details()->sum('patient_amount_clp');
    $this->total_commission_amount_clp = (int) $this->details()->sum('commission_amount_clp');
    $this->total_adjustments_clp = (int) $this->details()->sum('adjustment_amount_clp');
    
    // El total a pagar es la suma de los subtotales individuales de cada detalle menos los ajustes globales si los hubiera
    // En este sistema, el subtotal_clp de PayrollDetail ya es lo que recibe el doctor por esa sesión.
    $this->total_payable_clp = (int) ($this->details()->sum('subtotal_clp') - $this->total_adjustments_clp);
    
    $this->save();
  }
}
