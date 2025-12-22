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
        'base_price_clp',
        'duration_minutes',
        'require_diagnosis',
        'require_referral',
        'plan_discount_clp',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'require_diagnosis' => 'boolean',
        'require_referral' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
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
