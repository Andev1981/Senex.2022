<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class PayrollDetail extends Model
{

  use Multitenantable;

  protected $fillable = [
    'company_id',
    'payroll_id',
    'source_type',
    'source_id',
    'treatment_session_id',
    'patient_id',
    'doctor_id',
    'item_id',
    'service_date',
    'attended',
    'diagnostic_code',
    'diagnostic_name',
    'service_category',
    'weight',
    'patient_amount_clp',
    'commission_base_clp',
    'commission_amount_clp',
    'adjustment_amount_clp',
    'subtotal_clp',
    'rate_type',
    'rate_amount_clp',
    'rate_percentage',
    'calc_context',
    'notes',
  ];

  protected $casts = [
    'attended' => 'boolean',
    'weight' => 'integer',
    'patient_amount_clp' => 'integer',
    'commission_base_clp' => 'integer',
    'commission_amount_clp'  => 'integer',
    'adjustment_amount_clp' => 'integer',
    'subtotal_clp'  => 'integer',
    'rate_amount_clp'  => 'integer',
    'rate_percentage'  => 'decimal:2',
    'calc_context'  => 'array',
    'notes'  => 'string',
  ];

  // 1. Relación con la Liquidación Padre
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    // 2. Relación POLIMÓRFICA (La mágica)
    // Esto permite que $detail->source devuelva una TreatmentSession, 
    // un Bono, o cualquier cosa que hayas guardado en source_type/source_id
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    // 3. Relación Explícita (Opcional pero útil si quieres ser estricto)
    // Como guardaste también el 'treatment_session_id', puedes tener esta directa
    public function treatmentSession(): BelongsTo
    {
        return $this->belongsTo(TreatmentSession::class);
    }

    // 4. Relaciones de Negocio
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class); // O User::class si usas usuarios directos
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    /**
     * Alias para item (usado en vistas PDF y frontend heredado)
     */
    public function sessionType(): BelongsTo
    {
        return $this->item();
    }
}
