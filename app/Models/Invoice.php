<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    'patient_id',
    'treatment_session_id',
    'patient_plan_id',
    'type',
    'document_number',
    'issue_date',
    'subtotal',
    'tax_amount',
    'total_amount',
    'sii_status',
    'sii_track_id',
    'pdf_path',
    'xml_path',
    'status',
    'meta',
  ];

  protected $casts = [
    'issue_date'   => 'date',
    'subtotal'     => 'decimal:2',
    'tax_amount'   => 'decimal:2',
    'total_amount' => 'decimal:2',
    'meta'         => 'array',
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
  public function patientPlan()
  {
    return $this->belongsTo(PatientPlan::class);
  }
  public function items()
  {
    return $this->hasMany(InvoiceItem::class);
  }

  // ===== Scopes =====
  public function scopePendingSii($q)
  {
    return $q->where('sii_status', self::SII_PENDING);
  }
  public function scopeAccepted($q)
  {
    return $q->where('sii_status', self::SII_ACCEPTED);
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
