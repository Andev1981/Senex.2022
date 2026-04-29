<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientInsurance extends Model
{
    use HasFactory;

    protected $table = 'patient_insurances'; 

    protected $fillable = [
        'patient_id',
        'insurance_id',
        'plan_id',
        'affiliate_rut',
        'is_affiliate_holder',
        'is_active',
        'enrollment_date',
        'expiration_date',
    ];

    protected $casts = [
        'is_affiliate_holder' => 'boolean',
        'is_active' => 'boolean',
        'enrollment_date' => 'date',
        'expiration_date' => 'date',
    ];

    public function patient() : BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function insurance() : BelongsTo
    {
        return $this->belongsTo(Insurance::class);
    }
    
    public function plan() : BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
    
}
