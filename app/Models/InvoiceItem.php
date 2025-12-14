<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;


class InvoiceItem extends Model
{
  use Multitenantable;

  protected $fillable = [
    'company_id',
    'invoice_id',
    'treatment_session_id',
    'treatment_id',
    'description',
    'quantity',
    'unit_price_clp',
    'total_clp',
  ];

  protected $casts = [
    'quantity'       => 'integer',
    'unit_price_clp'     => 'decimal:2',
    'total_clp' => 'decimal:2',
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
