<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanSessionConsumption extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_plan_id',
        'treatment_session_id',
        'sessions_consumed',
        'consumed_at',
        'session_price',
        'notes',
    ];

    protected $casts = [
        'consumed_at' => 'datetime',
        'sessions_consumed' => 'integer',
        'session_price' => 'integer',
    ];

    // ==================
    // Relaciones
    // ==================
    
    public function patientPlan()
    {
        return $this->belongsTo(PatientPlan::class);
    }

    public function treatmentSession()
    {
        return $this->belongsTo(TreatmentSession::class);
    }

    // A través de patientPlan podemos acceder al paciente
    public function patient()
    {
        return $this->hasOneThrough(
            Patient::class,
            PatientPlan::class,
            'id', // Foreign key en patient_plans
            'id', // Foreign key en patients
            'patient_plan_id', // Local key en plan_session_consumptions
            'patient_id' // Local key en patient_plans
        );
    }

    // A través de patientPlan podemos acceder al plan
    public function plan()
    {
        return $this->hasOneThrough(
            Plan::class,
            PatientPlan::class,
            'id', // Foreign key en patient_plans
            'id', // Foreign key en plans
            'patient_plan_id', // Local key en plan_session_consumptions
            'plan_id' // Local key en patient_plans
        );
    }

    // ==================
    // Scopes
    // ==================
    
    public function scopeForPatientPlan($query, $patientPlanId)
    {
        return $query->where('patient_plan_id', $patientPlanId);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('consumed_at', [$startDate, $endDate]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('consumed_at', now()->month)
                     ->whereYear('consumed_at', now()->year);
    }

    public function scopeOrdered($query, $direction = 'desc')
    {
        return $query->orderBy('consumed_at', $direction);
    }

    // ==================
    // Métodos estáticos
    // ==================
    
    /**
     * Registrar consumo de sesión
     */
    public static function recordConsumption(
        int $patientPlanId,
        int $treatmentSessionId,
        int $sessionsConsumed = 1,
        ?int $sessionPrice = null,
        ?string $notes = null
    ) {
        $patientPlan = PatientPlan::findOrFail($patientPlanId);

        // Validar que haya sesiones disponibles
        if ($patientPlan->sessions_included !== null) {
            $remaining = $patientPlan->sessions_included - $patientPlan->sessions_used;
            if ($remaining < $sessionsConsumed) {
                throw new \Exception('No hay suficientes sesiones disponibles en el plan.');
            }
        }

        // Crear el registro de consumo
        $consumption = self::create([
            'patient_plan_id' => $patientPlanId,
            'treatment_session_id' => $treatmentSessionId,
            'sessions_consumed' => $sessionsConsumed,
            'consumed_at' => now(),
            'session_price' => $sessionPrice,
            'notes' => $notes,
        ]);

        // Actualizar sesiones usadas en el plan del paciente
        $patientPlan->increment('sessions_used', $sessionsConsumed);

        // Actualizar estado si se agotaron las sesiones
        if ($patientPlan->sessions_included !== null && 
            $patientPlan->sessions_used >= $patientPlan->sessions_included) {
            $patientPlan->update(['status' => 'exhausted']);
        }

        return $consumption;
    }

    /**
     * Revertir consumo (en caso de cancelación de sesión)
     */
    public function revert()
    {
        $patientPlan = $this->patientPlan;

        // Restar las sesiones consumidas
        $patientPlan->decrement('sessions_used', $this->sessions_consumed);

        // Si estaba exhausted, volver a active
        if ($patientPlan->status === 'exhausted' && $patientPlan->sessions_remaining > 0) {
            $patientPlan->update(['status' => 'active']);
        }

        // Eliminar el registro de consumo
        $this->delete();
    }

    // ==================
    // Accessors
    // ==================
    
    public function getFormattedPriceAttribute()
    {
        if (!$this->session_price) return null;
        
        return number_format($this->session_price, 0, ',', '.') . ' CLP';
    }

    public function getConsumedAtFormattedAttribute()
    {
        return $this->consumed_at->format('d/m/Y H:i');
    }

    // ==================
    // Events (opcional)
    // ==================
    
    protected static function booted()
    {
        // Validar antes de crear para evitar duplicados
        static::creating(function ($consumption) {
            $exists = self::where('patient_plan_id', $consumption->patient_plan_id)
                ->where('treatment_session_id', $consumption->treatment_session_id)
                ->exists();
            
            if ($exists) {
                throw new \Exception('Esta sesión ya fue registrada en el plan del paciente.');
            }
        });

        // Al eliminar, revertir el contador
        static::deleting(function ($consumption) {
            if (!$consumption->isForceDeleting()) {
                $consumption->patientPlan->decrement('sessions_used', $consumption->sessions_consumed);
            }
        });
    }
}