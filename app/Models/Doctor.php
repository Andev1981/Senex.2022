<?php

namespace App\Models;

use App\Models\Concerns\HasAddresses;
use App\Traits\Multitenantable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Doctor extends Model
{
    use HasFactory, HasAddresses;

    protected $fillable = [
        'user_id',
        'name',
        'last_name',
        'rut',
        'email',
        'phone',
        'speciality',
        'birth_date',
        'gender',
        'mobile_access_enabled',
    ];

    protected $casts = [
        'birth_date' => 'date:Y-m-d',
        'status_changed_at' => 'datetime',
        'mobile_access_enabled' => 'boolean',
    ];

    /* RELACIONES */
    // Indica la relación M:N con Company
    public function companies(): BelongsToMany
    {
        // Usa la tabla pivote 'company_doctor'. 
        // withPivot() te permite acceder a campos de la tabla pivote (como la tarifa).
        return $this->belongsToMany(Company::class, 'company_doctor')
        ->withPivot('tarifa_acordada','porcentaje_comision','estado_convenio')
        ->withTimestamps();
    }

    public function patientAssignments(): HasMany
    {
        return $this->hasMany(DoctorPatientAssignment::class);
    }

    public function patients(): BelongsToMany
    {
        // sigue sirviendo belongsToMany para consultar “solo pacientes”
          return $this->belongsToMany(Patient::class, 'doctor_patient_assignments')
        ->select('patients.*', DB::raw('patients.id as patient_id'))
        ->withPivot(['role', 'started_at', 'ended_at', 'notes', 'meta'])
        ->withTimestamps();
    }

    public function sessions() : HasMany{
        return $this->hasMany(TreatmentSession::class);
    }

     public function user() : BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function commissionRates(): HasMany
    {
        return $this->hasMany(DoctorCommissionRate::class);
    }

    public function activeCommissionRates(): HasMany
    {
        return $this->hasMany(DoctorCommissionRate::class)
            ->active()
            ->validAt(now());
    }

    /*  ----------------- CÁLCULOS -------------------- */
    public function getCommissionForSession($sessionTypeId, $basePrice)
    {
        $rate = DoctorCommissionRate::getApplicableCommission(
            $this->id,
            $sessionTypeId
        );

        if (!$rate) {
            return 0; // Sin comisión configurada
        }

        return $rate->calculateCommission($basePrice);
    }
        
    /* -------------- Attributes GETTERS ---------------- */

    /* Sesiones del mes */
    public function sessionsMonth(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->sessions()
                            ->whereMonth('date', now()->month)
                            ->whereYear('date', now()->year)
                            ->count()
        );
    }

    /* Ganancias del mes */
    public function revenueMonth(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->sessions()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('doctor_amount')
        );
    }
    
    /* Pacientes asignados */
     public function assignedPatients(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->patients ? $this->patients : null,
        );
    }

    /* Edad */
    public function age() : Attribute
    {
        return Attribute::make(
            get : fn () => trim(
               $this->birth_date ? $this->birth_date->diffInYears(Carbon::now()) : null,
            ),
        );
       
    }

    /* Dirección completa */
    protected function fullAddress(): Attribute
    {
        return Attribute::make(
            // El Closure para el GETTER (lectura)
            get: fn () => trim(
               // 1. Acceso a la Calle: Usa Nullsafe en la relación ($this->address?->street)
                //    y la coalescencia de null (??) para asegurar una cadena vacía.
                ($this->address?->street ?? '') 
                
                // 2. Acceso al Número: Nullsafe en la relación
                . ' ' . ($this->address?->number ?? '') 
                
                // 3. Acceso a la Comuna: Nullsafe en la relación (address) Y en la sub-relación (commune)
                . ' '. ($this->address?->commune?->name ?? '') 
                
                // 4. Acceso a la Provincia: Nullsafe en ambas relaciones
                . ' '. ($this->address?->province?->name ?? '')
                
                // 5. Acceso a la Región: Nullsafe en ambas relaciones
                . ' '. ($this->address?->region?->name ?? '')
            ),
        );
            
    }

    /* Nombre completo */
     public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(
                ($this->name ?? '') . ' ' . ($this->last_name ?? '')
            ),
        );
    }


    protected $appends = [
        'age', /* Edad */
        'full_address',/* Dirección completa */
        'assigned_patients',/* Pacientes Asignados */
        'sessions_month',/* Sesiones del mes */
        'revenue_month',/* Ganancias del mes */
        'full_name',/* Nombre completo */
    ];
}
