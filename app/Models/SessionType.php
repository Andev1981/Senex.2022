<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionType extends Model
{
    protected $fillable = [
        'name',
        'base_price',
        'duration_minutes',
        'plan_eligible',
        'plan_session_value',
        'active'
    ];

    protected $casts = [
        'base_price' => 'integer',
        'plan_eligible' => 'boolean',
        'plan_session_value' => 'integer',
        'active' => 'boolean',
    ];

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
