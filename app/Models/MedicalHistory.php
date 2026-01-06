<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalHistory extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'patient_id',
        'recorded_by_user_id',
        
        // Biológicos
        'blood_type',
        'handedness',
        
        // Hábitos
        'activity_level',
        'smoking_status',
        'alcohol_consumption',
        
        // JSONs Clínicos (Arrays)
        'pathologies',
        'surgeries',
        'fractures',
        'allergies',
        'medications',
        'family_history', // Si decidiste usarlo como JSON o string

        // Banderas Rojas
        'has_pacemaker',
        'has_metal_implants',
        'is_pregnant',
        'cancer_history',
        
        'notes',
    ];

    protected $casts = [
        // Convertimos los JSON de la BD a Arrays de PHP automáticamente
        'pathologies' => 'array',
        'surgeries' => 'array',
        'fractures' => 'array',
        'allergies' => 'array',
        'medications' => 'array',
        'family_history' => 'array', // Si es JSON

        'has_pacemaker' => 'boolean',
        'has_metal_implants' => 'boolean',
        'is_pregnant' => 'boolean',
        'cancer_history' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}