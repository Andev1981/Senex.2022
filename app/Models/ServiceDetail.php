<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'duration_minutes',
        'requires_diagnosis',
        'requires_referral',
        'commission_type',
        'default_doctor_commission_clp',
        'default_doctor_commission_own_clp',
        'default_doctor_commission_assigned_clp',
        'default_doctor_commission_percentage',
        'default_doctor_commission_own_percentage',
        'default_doctor_commission_assigned_percentage',
        'specialty',
        'billing_code',
        'agenda_color',
        'patient_instructions',
        'allows_onsite',
        'allows_online',
        'allows_home',
        'max_simultaneous_patients',
        'requires_consent',
        'is_evaluation',
    ];

    protected $casts = [
        'requires_diagnosis' => 'boolean',
        'requires_referral' => 'boolean',
        'default_doctor_commission_clp' => 'integer',
        'default_doctor_commission_own_clp' => 'integer',
        'default_doctor_commission_assigned_clp' => 'integer',
        'default_doctor_commission_percentage' => 'decimal:2',
        'default_doctor_commission_own_percentage' => 'decimal:2',
        'default_doctor_commission_assigned_percentage' => 'decimal:2',
        'duration_minutes' => 'integer',
        'allows_onsite' => 'boolean',
        'allows_online' => 'boolean',
        'allows_home' => 'boolean',
        'max_simultaneous_patients' => 'integer',
        'requires_consent' => 'boolean',
        'is_evaluation' => 'boolean',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
