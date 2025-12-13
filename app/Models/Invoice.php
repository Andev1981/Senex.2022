<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{


  // ===== Tipos de documento (ajusta a tu proveedor) =====
  public const TYPE_BOLETA   = 'boleta';
  public const TYPE_FACTURA  = 'factura';
  public const TYPE_NCREDITO = 'nota_credito';
  public const TYPE_NDEBITO  = 'nota_debito';

  // ===== Estados DTE y locales =====
  public const SII_PENDING  = 'pending';
  public const SII_SENT     = 'sent';
  public const SII_ACCEPTED = 'accepted';
  public const SII_REJECTED = 'rejected';

  public const STATUS_DRAFT   = 'draft';
  public const STATUS_ISSUED  = 'issued';
  public const STATUS_PAID    = 'paid';
  public const STATUS_CANCELLED = 'cancelled';

  protected $fillable = [
    'company_id',
    'branch_id',
    'patient_id',
    'payment_id',
    'dte_type',
    'dte_folio',
    'issue_date',
    'dte_status',
    'dte_track_id',
    'dte_xml',
    'net_clp',
    'iva_clp',
    'total_clp',
    'pdf_path',
    'glosa_rechazo',
    'metadata',
  ];

  protected $casts = [
    'issue_date'   => 'date',
    'net_clp'     => 'decimal:2',
    'iva_clp'   => 'decimal:2',
    'total_clp' => 'decimal:2',
    'meta'         => 'array',
  ];

  // ===== Relaciones =====
  public function companySetting(): BelongsTo
  {
    return $this->belongsTo(Company::class);
  }

  public function patient(): BelongsTo
  {
    return $this->belongsTo(Patient::class);
  }
  
  public function payment():BelongsTo
  {
    return $this->belongsTo(Payment::class);
  }
  public function items(): HasMany
  {
    return $this->hasMany(InvoiceItem::class);
  }

  // ===== Scopes =====
  public function scopePendingSii($q)
  {
    return $q->where('dte_status', self::SII_PENDING);
  }
  public function scopeAccepted($q)
  {
    return $q->where('dte_status', self::SII_ACCEPTED);
  }
  public function scopeIssued($q)
  {
    return $q->where('status', self::STATUS_ISSUED);
  }
  public function scopePaid($q)
  {
    return $q->where('status', self::STATUS_PAID);
  }

  // ===== Helpers de estado =====
  public function isPaid(): bool
  {
    return $this->status === self::STATUS_PAID;
  }
  public function markIssued(?string $number = null): void
  {
    $this->status = self::STATUS_ISSUED;
    if ($number) $this->document_number = $number;
    $this->save();
  }
  public function markAccepted(?string $trackId = null): void
  {
    $this->sii_status = self::SII_ACCEPTED;
    if ($trackId) $this->sii_track_id = $trackId;
    $this->save();
  }
  public function markRejected(?string $reason = null): void
  {
    $this->sii_status = self::SII_REJECTED;
    $meta = $this->meta ?? [];
    if ($reason) $meta['reject_reason'] = $reason;
    $this->meta = $meta;
    $this->save();
  }
  public function settleAsPaid(): void
  {
    $this->status = self::STATUS_PAID;
    $this->save();
  }

  // ===== Cálculo rápido (si necesitas recalcular) =====
  public function recalcTotalsFromItems(int $taxRate = 0, bool $taxExempt = true): void
  {
    $subtotal = (float) $this->items()->sum('line_total');
    $tax = $taxExempt ? 0 : round($subtotal * ($taxRate / 100), 2);
    $this->subtotal = $subtotal;
    $this->tax_amount = $tax;
    $this->total_amount = $subtotal + $tax;
    $this->save();
  }
}
