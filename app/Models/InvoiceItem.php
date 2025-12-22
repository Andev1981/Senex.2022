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
        'session_type_id',
        'treatment_session_id',
        'agreement_item_id',
        'description',
        'quantity',
        'unit_price',
        'unit_insurance_primary',
        'unit_insurance_secondary',
        'unit_patient',
        'total_gross',
        'total_patient',
        'is_exento',
  ];


  public function invoice()
  {
    return $this->belongsTo(Invoice::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }
  
  public function sessionType()
  {
    return $this->belongsTo(SessionType::class);
  }

  // Helper para setear totales coherentes
  public function syncLineTotal(): void
  {
    $qty = max(1, (int)$this->quantity);
    $this->line_total = max(0, ($this->unit_price * $qty) - (float)$this->discount_amount);
    $this->save();
  }
}
