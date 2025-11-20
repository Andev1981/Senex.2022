<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'codigo',
        'institution_type',
        'institution_id',
        'type',
        'total_sessions',
        'price',
        'valid_months',
        'session_types',
        'description',
        'coverage',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'session_types' => 'array',
        'price' => 'integer',
        'total_sessions' => 'integer',
        'valid_months' => 'integer',
    ];

    // Polymorphic relationships
    public function healthInsurer()
    {
        return $this->belongsTo(HealthInsurer::class, 'institution_id')
            ->where('institution_type', 'health_insurer');
    }

    public function insuranceCompany()
    {
        return $this->belongsTo(InsuranceCompany::class, 'institution_id')
            ->where('institution_type', 'insurance_company');
    }

    // Accessor to get the related institution
    public function getInstitutionAttribute()
    {
        if ($this->institution_type === 'health_insurer') {
            return $this->healthInsurer;
        }
        return $this->insuranceCompany;
    }
}