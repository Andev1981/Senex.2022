<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'insurance_id',
        'type',
        'billing_type',           // 👈 Nuevo
        'insurance_policy_type',  // 👈 Nuevo
        'valid_months',
        'start_date',
        'end_date',
        'coverage_percentage',
        'price',
        'initial_fee',
        'is_active',
        'description',
        'is_family',
        'is_internal',
    ];

    protected $casts = [
        'is_family' => 'boolean',
        'price' => 'integer',
        'valid_months' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Relación con las instancias de planes de pacientes
    public function patientPlans(): HasMany
    {
        return $this->hasMany(PatientPlan::class);
    }

    // Relación M:1 con Aseguradora (Un plan pertenece a una aseguradora)
    public function insurance(): BelongsTo
    {
        // La FK 'insurance_id' está en la tabla 'plans'
        return $this->belongsTo(Insurance::class);
    }

    // Relación 1:M con ítems de Convenio (El plan define la regla específica en el tarifario)
    public function agreementRules(): HasMany
    {
        // La FK 'plan_id' está en la tabla 'agreement_rules'
        return $this->hasMany(AgreementRule::class);
    }

    public function sessionTypes(): BelongsToMany
    {
        // 💡 Usando el Pivot Model (PlanContent)
        return $this->belongsToMany(SessionType::class, 'plan_session_type')
            ->using(PlanContent::class)
            ->withPivot('max_sessions'); // Puedes acceder a este campo directamente
    }
}
