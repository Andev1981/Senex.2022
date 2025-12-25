<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{

  use Multitenantable;

  // ===== Códigos Oficiales SII =====
  public const TYPE_FACTURA          = 33;
  public const TYPE_FACTURA_EXENTA   = 34;
  public const TYPE_BOLETA           = 39;
  public const TYPE_BOLETA_EXENTA    = 41; // Muy común en salud (sin IVA)
  public const TYPE_NCREDITO         = 61;
  public const TYPE_NDEBITO          = 56;

  // ===== Estados TRIBUTARIOS (Relación con el SII) =====
  public const SII_STATUS_PENDING  = 'pending';  // Aún no enviado al SII
  public const SII_STATUS_SENT     = 'sent';     // Enviado, esperando respuesta
  public const SII_STATUS_ACCEPTED  = 'accepted'; // ¡Todo OK!
  public const SII_STATUS_REJECTED  = 'rejected'; // Hubo un error (ej. Folio duplicado)

  // ===== Estados FINANCIEROS (Relación con tu caja) =====
  public const PAYMENT_STATUS_UNPAID  = 'unpaid';  // Emitida pero no pagada (ej. Factura a 30 días)
  public const PAYMENT_STATUS_PAID    = 'paid';    // Dinero recibido
  public const PAYMENT_STATUS_VOIDED  = 'voided';  // Anulada administrativamente

  protected $fillable = [
    'company_id',
    'branch_id',
    'user_id',            // Quién emitió la boleta (Cajero)
    'patient_id',
    'payment_id',
    'insurance_id',
    'entity_type',        // Polimórfico: Receptor (Patient o Company)
    'entity_id',

    // --- MONTOS CONTABLES (VITALES) ---
    'amount_neto_clp',        // Monto Afecto antes de IVA
    'amount_exento_clp',      // Monto que no paga IVA (Servicios Médicos)
    'amount_iva_clp',         // El 19% del Neto
    'amount_total_clp',       // Neto + Exento + IVA

    // --- DESGLOSE DE COPAGO (CLÍNICO) ---
    'amount_gross_clp',              // Valor arancel total
    'amount_insurance_primary_clp',  // Aporte Isapre/Fonasa
    'amount_insurance_secondary_clp', // Aporte Seguro Complementario
    'amount_patient_clp',            // Lo que efectivamente sale del bolsillo del paciente

    // --- DATOS SII / DTE ---
    'dte_type',           // 33, 34, 39, 41, 61
    'dte_folio',          // Número correlativo legal
    'issue_date',         // Fecha de emisión
    'dte_status',         // pending, accepted, rejected
    'dte_track_id',       // ID de seguimiento del SII
    'dte_xml',            // XML del documento
    'pdf_path',           // Ruta al PDF de respaldo físico

    // --- ESTADOS LOCALES ---
    'payment_status',     // paid, unpaid, voided
    'metadata',           // Datos extra del proveedor DTE
  ];

  protected $casts = [
    'metadata' => 'array',
    'issue_date' => 'date',
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

  public function payment(): BelongsTo
  {
    return $this->belongsTo(Payment::class);
  }
  public function items(): HasMany
  {
    return $this->hasMany(InvoiceItem::class);
  }

  // "Tengo un DTE asociado (o varios si hubo notas de crédito)"
  public function dtes()
  {
    return $this->morphMany(Dte::class, 'origin');
  }

  // Helper para obtener el DTE activo (vigente)
  public function currentDte()
  {
    return $this->morphOne(Dte::class, 'origin')
      ->where('estado_sii', '!=', 'ANULADO') // O tu lógica de status
      ->latestOfMany();
  }

  /* public function treatmentSession(): HasMany
  {
    return $this->hasMany(TreatmentSession::class);
  } */

  // ===== Scopes =====
  public function scopePendingSii($q)
  {
    return $q->where('dte_status', self::SII_STATUS_PENDING);
  }
  public function scopeAccepted($q)
  {
    return $q->where('dte_status', self::SII_STATUS_ACCEPTED);
  }
  public function scopeVoided($q)
  {
    return $q->where('status', self::PAYMENT_STATUS_VOIDED);
  }
  public function scopePaid($q)
  {
    return $q->where('status', self::PAYMENT_STATUS_PAID);
  }

  // ===== Helpers de estado =====
  public function isPaid(): bool
  {
    return $this->status === self::PAYMENT_STATUS_PAID;
  }
  public function markVoided(?string $number = null): void
  {
    $this->status = self::PAYMENT_STATUS_VOIDED;
    if ($number) $this->document_number = $number;
    $this->save();
  }
  public function markAccepted(?string $trackId = null): void
  {
    $this->sii_status = self::SII_STATUS_ACCEPTED;
    if ($trackId) $this->sii_track_id = $trackId;
    $this->save();
  }
  public function markRejected(?string $reason = null): void
  {
    $this->sii_status = self::SII_STATUS_REJECTED;
    $meta = $this->meta ?? [];
    if ($reason) $meta['reject_reason'] = $reason;
    $this->meta = $meta;
    $this->save();
  }
  public function settleAsPaid(): void
  {
    $this->status = self::PAYMENT_STATUS_PAID;
    $this->save();
  }

  // ===== Cálculo rápido (si necesitas recalcular) =====
  public function recalcTotalsFromItems(int $taxRate = 0, bool $taxExempt = true): void
  {
    $subtotal_clp = (float) $this->items()->sum('line_total');
    $tax = $taxExempt ? 0 : round($subtotal_clp * ($taxRate / 100), 2);
    $this->subtotal_clp = $subtotal_clp;
    $this->tax_amount = $tax;
    $this->total_amount = $subtotal_clp + $tax;
    $this->save();
  }


  public function getTypeNameAttribute(): string
  {
    return match ($this->dte_type) {
      self::TYPE_FACTURA        => 'Factura Electrónica',
      self::TYPE_FACTURA_EXENTA => 'Factura Exenta',
      self::TYPE_BOLETA         => 'Boleta Electrónica',
      self::TYPE_BOLETA_EXENTA  => 'Boleta Exenta',
      self::TYPE_NCREDITO       => 'Nota de Crédito',
      self::TYPE_NDEBITO        => 'Nota de Débito',
      default                   => 'Documento Desconocido',
    };
  }
  protected $appends = ['type_name']; // Para que se incluya en el JSON de Inertia
}
