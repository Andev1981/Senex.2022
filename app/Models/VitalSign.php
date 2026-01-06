<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VitalSign extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'patient_id',
        'recorded_by_user_id',
        
        // Polimorfismo
        'source_type',
        'source_id',
        
        'recorded_at',
        'context', // resting, active...

        // Métricas
        'height_cm',
        'weight_kg',
        'bmi',
        // 'blood_type', // REMOVIDO (Está en MedicalHistory)
        'bp_systolic',
        'bp_diastolic',
        'heart_rate',
        'resp_rate',
        'temperature_c',
        'spo2',
        
        'meta',
        'notes', // Si agregaste notes en la migración
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'meta' => 'array',
        // decimales se castean solos a string o float dependiendo de configuración, 
        // pero puedes forzarlos a float si prefieres:
        'weight_kg' => 'float',
        'bmi' => 'float',
        'heart_rate' => 'float',
        'temperature_c' => 'float',
        'spo2' => 'float',
    ];

    // --- Relaciones ---

    // La magia polimórfica: Devuelve la Session o la Evaluación a la que pertenece
    public function source()
    {
        return $this->morphTo();
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}