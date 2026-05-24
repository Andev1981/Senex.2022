<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Enums\FinanceStatusEnum;
use App\Enums\DteStatusEnum;

class Invoice extends Model
{
  use Multitenantable;

  // ===== Códigos Oficiales SII (Mantener por utilidad en código) =====
  public const TYPE_FACTURA          = 33;
  public const TYPE_FACTURA_EXENTA   = 34;
  public const TYPE_BOLETA           = 39;
  public const TYPE_BOLETA_EXENTA    = 41; 
  public const TYPE_NCREDITO         = 61;
  public const TYPE_NDEBITO          = 56;

  // ===== Estados TRIBUTARIOS (Sincronizados con Enum) =====
  public const SII_STATUS_PENDING  = 'pending';
  public const SII_STATUS_SENT     = 'sent';
  public const SII_STATUS_ACCEPTED  = 'accepted';
  public const SII_STATUS_REJECTED  = 'rejected';
  public const SII_STATUS_ERROR     = 'error';

  protected $fillable = [
    'company_id',
        'branch_id',
        'user_id',
        'patient_id',
        'insurance_id',
    'entity_type',        // Polimórfico: Receptor (Patient o Company)
    'entity_id',

    // --- MONTOS CONTABLES (VITALES) ---
    'net_amount_clp',        // Amount subject to VAT
    'exempt_amount_clp',     // Amount exempt from VAT (Health Services)
    'vat_amount_clp',        // 19% VAT
    'total_amount_clp',      // Net + Exempt + VAT

    // --- DESGLOSE DE COPAGO (CLÍNICO) ---
    'amount_gross_clp',              // Valor arancel total
    'amount_insurance_primary_clp',  // Aporte Isapre/Fonasa
    'amount_insurance_secondary_clp', // Aporte Seguro Complementario
    'amount_patient_clp',            // Lo que efectivamente sale del bolsillo del paciente
    'paid_amount_clp',               // Monto total efectivamente pagado

    // --- DATOS SII / DTE ---
    'dte_type',           // 33, 34, 39, 41, 61
    'dte_folio',          // Número correlativo legal
    'issue_date',         // Fecha de emisión
    'dte_status',         // pending, accepted, rejected
    'dte_xml',            // XML del documento
    'pdf_path',           // Ruta al PDF de respaldo físico

    // --- ESTADOS LOCALES ---
    'payment_status',     // paid, unpaid, voided
    'transaction_number',
    'transaction_date',
    'global_discount_clp',
    'metadata',           // Datos extra del proveedor DTE
  ];

  protected $casts = [
    'metadata' => 'array',
    'issue_date' => 'date',
    'transaction_date' => 'date',
    'payment_status' => FinanceStatusEnum::class,
    'dte_status' => DteStatusEnum::class,
    'net_amount_clp' => 'integer',
    'exempt_amount_clp' => 'integer',
    'vat_amount_clp' => 'integer',
    'total_amount_clp' => 'integer',
    'amount_gross_clp' => 'integer',
    'amount_insurance_primary_clp' => 'integer',
    'amount_insurance_secondary_clp' => 'integer',
    'amount_patient_clp' => 'integer',
    'paid_amount_clp' => 'integer',
    'global_discount_clp' => 'integer',
  ];

  // ===== Relaciones =====
  public function company(): BelongsTo
  {
    return $this->belongsTo(Company::class);
  }

  public function branch(): BelongsTo
  {
    return $this->belongsTo(Branch::class);
  }

  public function patient(): BelongsTo
  {
    return $this->belongsTo(Patient::class);
  }

  public function paymentAllocations(): HasMany
  {
    return $this->hasMany(PaymentAllocation::class);
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
    return $q->where('dte_status', DteStatusEnum::PENDING);
  }
  public function scopeAccepted($q)
  {
    return $q->where('dte_status', DteStatusEnum::ACCEPTED);
  }
  public function scopeVoided($q)
  {
    return $q->where('payment_status', FinanceStatusEnum::VOIDED);
  }
  public function scopePaid($q)
  {
    return $q->where('payment_status', FinanceStatusEnum::PAID);
  }

  // ===== Helpers de estado =====
  public function isPaid(): bool
  {
    return $this->payment_status === FinanceStatusEnum::PAID;
  }
  public function markVoided(?string $number = null): void
  {
    $this->payment_status = FinanceStatusEnum::VOIDED;
    if ($number) $this->dte_folio = $number;
    $this->save();
  }
  public function markAccepted(?string $trackId = null): void
  {
    $this->dte_status = DteStatusEnum::ACCEPTED;
    // El track_id se guarda en la relación DTE, pero si queremos guardarlo aquí también
    if ($trackId) {
        $meta = $this->metadata ?? [];
        $meta['sii_track_id'] = $trackId;
        $this->metadata = $meta;
    }
    $this->save();
  }
  public function markRejected(?string $reason = null): void
  {
    $this->dte_status = DteStatusEnum::REJECTED;
    $meta = $this->metadata ?? [];
    if ($reason) $meta['reject_reason'] = $reason;
    $this->metadata = $meta;
    $this->save();
  }
  public function settleAsPaid(): void
  {
    $this->payment_status = FinanceStatusEnum::PAID;
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
