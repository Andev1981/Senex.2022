<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class InvoiceItem extends Model
{


  protected $fillable = [
    'invoice_id',
    'description',
    'session_type_id',
    'quantity',
    'unit_price',
    'discount_amount',
    'line_total',
    'tax_exempt',
    'sii_item_code',
  ];

  protected $casts = [
    'quantity'       => 'integer',
    'unit_price'     => 'decimal:2',
    'discount_amount' => 'decimal:2',
    'line_total'     => 'decimal:2',
    'tax_exempt'     => 'boolean',
  ];

  public function invoice()
  {
    return $this->belongsTo(Invoice::class);
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
