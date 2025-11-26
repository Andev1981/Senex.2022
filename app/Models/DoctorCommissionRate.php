<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorCommissionRate extends Model
{


  public const TYPE_PERCENTAGE  = 'percentage';
  public const TYPE_FIXED       = 'fixed_amount';

  protected $fillable = [
    'doctor_id',
    'session_type_id',
    'commission_type',
    'commission_value',
    'effective_from',
    'effective_until',
    'is_active',
    'notes',
  ];

  protected $casts = [
    'commission_value' => 'integer',
    'effective_from'   => 'date',
    'effective_until'  => 'date',
    'is_active'        => 'boolean',
  ];

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function sessionType()
  {
    return $this->belongsTo(SessionType::class);
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

    public function scopeForSessionType($query, $sessionTypeId)
    {
        return $query->where(function ($q) use ($sessionTypeId) {
            $q->where('session_type_id', $sessionTypeId)
              ->orWhereNull('session_type_id'); // Comisión general
        });
    }

    // Métodos de cálculo
    public function calculateCommission($basePrice)
    {
        switch ($this->commission_type) {
            case 'percentage':
                return ($basePrice * $this->commission_percentage) / 100;
                
            case 'fixed':
                return $this->fixed_commission;
                
            case 'hybrid':
                $percentageAmount = ($basePrice * $this->commission_percentage) / 100;
                return $percentageAmount + $this->fixed_commission;
                
            default:
                return 0;
        }
    }

    // Método estático para obtener comisión aplicable
    public static function getApplicableCommission($doctorId, $sessionTypeId, $date = null)
    {
        // Buscar comisión específica para el tipo de sesión
        $commission = self::active()
            ->validAt($date)
            ->forDoctor($doctorId)
            ->forSessionType($sessionTypeId)
            ->orderByRaw('session_type_id IS NULL') // Primero las específicas
            ->first();

        return $commission;
    }
}