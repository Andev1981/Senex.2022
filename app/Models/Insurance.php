<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Insurance extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'name',
        'rut',
        'institution_type',
        'contact_email',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relación 1:M con Planes (Una aseguradora tiene muchos planes)
    public function plans()
    {
        // La FK 'insurance_id' está en la tabla 'plans'
        return $this->hasMany(Plan::class);
    }

    // Relación 1:M con Convenios (Una aseguradora puede tener varios acuerdos tarifarios)
    public function agreements()
    {
        // La FK 'insurance_id' está en la tabla 'agreements'
        return $this->hasMany(Agreement::class);
    }

    // Relación N:M con Pacientes (Muchos pacientes usan esta aseguradora)
    public function patients()
    {
        return $this->belongsToMany(Patient::class, 'patients_insurances')
                    ->using(PatientInsurance::class)
                    ->withPivot(['plan_id', 'is_active', 'affiliate_rut', 'is_affiliate_holder'])
                    ->withTimestamps();
    }
}