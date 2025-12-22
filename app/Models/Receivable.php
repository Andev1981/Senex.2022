<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Receivable extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'payment_id',
        'patient_id',
        'insurance_id',
        'insurance_type', // 💡 Sugerido: 'primary' o 'secondary'
        'amount_clp',
        'external_transaction_code', // Aquí va el folio I-Med
        'status', // 'pending', 'settled', 'void'
        'due_date',
        'settled_at',
        'notes',
    ];

    protected $casts = [
        'amount_clp' => 'integer',
        'due_date' => 'date',
        'settled_at' => 'datetime', // Datetime es mejor para precisión de cierre de caja
    ];

    /**
     * Relación con el pago original (vínculo al copago y metadata)
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Relación con la Isapre o Seguro que debe el dinero
     */
    public function insurance(): BelongsTo
    {
        return $this->belongsTo(Insurance::class);
    }

    /**
     * Relación con el paciente (Útil para saber a quién se le hizo la prestación)
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Scope para filtrar deudas de Isapre vs Complementarios
     */
    public function scopePrimary($query)
    {
        return $query->where('insurance_type', 'primary');
    }
}