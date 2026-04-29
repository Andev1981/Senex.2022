<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;


class InvoiceItem extends Model
{
  use Multitenantable;

  protected $fillable = [
    'invoice_id',
    'company_id',
    'branch_id',
    'treatment_session_id',
    'agreement_rule_id',
    'sellable_id',
    'sellable_type',
    'description',
    'comment',
    'quantity',
    'unit_price_clp',
    'unit_insurance_primary_clp',
    'unit_insurance_secondary_clp',
    'unit_patient_clp',
    'total_gross_clp',
    'total_patient_clp',
    'discount_percentage',
    'is_exento',
  ];

  public function sellable()
  {
    // Esto permite que el ítem sea un "TreatmentSession" O un "Product"
    return $this->morphTo();
  }

  public function invoice()
  {
    return $this->belongsTo(Invoice::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }

  public function item()
  {
    return $this->belongsTo(Item::class);
  }

  // Helper para setear totales coherentes
  public function syncLineTotal(): void
  {
    $qty = max(1, (int)$this->quantity);
    $this->line_total = max(0, ($this->unit_price_clp * $qty) - (float)$this->discount_amount);
    $this->save();
  }
}
