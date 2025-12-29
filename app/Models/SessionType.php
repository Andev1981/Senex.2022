<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

class SessionType extends Model
{
    use Multitenantable;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'category',
        'duration_minutes',
        'base_price_clp',
        'plan_discount_clp',
        'default_doctor_commission_clp',
        'requires_diagnosis',
        'requires_referral',
        'is_exempt',
        'is_active'
    ];

    protected $casts = [
        'requires_diagnosis' => 'boolean',
        'requires_referral' => 'boolean',
        'is_exempt' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function branchSettings()
    {
        return $this->belongsToMany(Branch::class, 'branch_session_type')
            ->withPivot([
                'custom_price_clp',
                'custom_doctor_commission_clp',
                'custom_duration_minutes',
                'is_active_in_branch',
                'custom_code',
            ])
            ->using(BranchSessionType::class) // Vinculamos el modelo Pivot
            ->withTimestamps();
    }

    // Relaciones sugeridas (ajusta nombres de modelos si difieren)
    public function treatmentSessions()
    {
        return $this->hasMany(TreatmentSession::class);
    }

    public function defaultForTreatments()
    {
        return $this->hasMany(Treatment::class, 'default_session_type_id');
    }

    // Scopes útiles
    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }
}
