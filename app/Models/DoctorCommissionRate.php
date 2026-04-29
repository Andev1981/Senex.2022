<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

class DoctorCommissionRate extends Model
{
    use Multitenantable;

    public const TYPE_PERCENTAGE  = 'percentage';
    public const TYPE_FIXED       = 'fixed_amount';

    protected $fillable = [
        'company_id',
        'doctor_id',
        'session_type_id',
        'commission_type',
        'amount_clp',
        'commission_percentage',
        'effective_from',
        'effective_until',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'amount_clp' => 'integer',
        'effective_from'   => 'date',
        'effective_until'  => 'date',
        'is_active'        => 'boolean',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'session_type_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValidAt($query, $date = null)
    {
        $date = $date ?? now();

        return $query->where(function ($q) use ($date) {
            $q->where('effective_from', '<=', $date)
                ->orWhereNull('effective_from');
        })->where(function ($q) use ($date) {
            $q->where('effective_until', '>=', $date)
                ->orWhereNull('effective_until');
        });
    }

    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeForItem($query, $itemId)
    {
        return $query->where(function ($q) use ($itemId) {
            $q->where('session_type_id', $itemId)
                ->orWhereNull('session_type_id'); // Comisión general
        });
    }

    public function scopeForSessionType($query, $itemId)
    {
        return $this->scopeForItem($query, $itemId);
    }

    // Métodos de cálculo
    public function calculateCommission($basePrice)
    {
        switch ($this->commission_type) {
            case 'percentage':
                return ($basePrice * $this->commission_percentage) / 100;

            case 'fixed_amount':
                return $this->amount_clp;

            default:
                return 0;
        }
    }

    // Método estático para obtener comisión aplicable
    public static function getApplicableCommission($doctorId, $itemId, $date = null)
    {
        // Buscar comisión específica para el tipo de ítem
        $commission = self::active()
            ->validAt($date)
            ->forDoctor($doctorId)
            ->forSessionType($itemId)
            ->orderByRaw('session_type_id IS NULL') // Primero las específicas
            ->first();

        return $commission;
    }
}
