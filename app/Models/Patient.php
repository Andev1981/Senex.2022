<?php

namespace App\Models;

use App\Models\Concerns\HasAddresses;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\URL;
use Illuminate\Notifications\Notifiable;

class Patient extends Authenticatable
{
    use HasFactory, HasAddresses, Notifiable, Multitenantable;

    protected $fillable = [
        'company_id',
        'name',
        'last_name',
        'rut',
        'email',
        'phone',
        'birth_date',
        'gender',
        'occupation',
        'marital_status',
        'status',
        'status_reason',
        'status_changed_at',
        'opt_out_reminders',
        'prefers_whatsapp',
        'prefers_sms',
        'prefers_mail',
        'require_tutor',
        'notes',
    ];


    protected $casts = [
        'birth_date' => 'date:Y-m-d',
        'status_changed_at' => 'datetime',
        'opt_out_reminders' => 'boolean',
        'prefers_whatsapp'  => 'boolean',
        'prefers_mail'      => 'boolean',
        'prefers_sms'       => 'boolean',
        'require_tutor'     => 'boolean',
    ];

    /* RELACIONES */
    // Indica la relación M:N con Company
    public function companies(): BelongsToMany
    {
        // Usa la tabla pivote 'company_doctor'. 
        // withPivot() te permite acceder a campos de la tabla pivote (como la tarifa).
        return $this->belongsToMany(Company::class, 'company_patient')
            ->withPivot('ficha_clinica_local_id', 'fecha_primer_contacto')
            ->withTimestamps();
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_patient')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function insurances()
    {
        // Usa la tabla patients_insurances como pivot y PatientInsurance como modelo
        return $this->belongsToMany(Insurance::class, 'patient_insurances')
            ->using(PatientInsurance::class)
            ->withPivot(['plan_id', 'is_active', 'affiliate_rut', 'is_affiliate_holder'])
            ->withTimestamps();
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TreatmentSession::class);
    }

    public function vitals(): HasMany
    {
        return $this->hasMany(Vital::class);
    }
    public function latestVital(): HasOne
    {
        return $this->hasOne(Vital::class)->latestOfMany('created_at');
    }

    public function allergies(): HasMany
    {
        return $this->hasMany(PatientAllergy::class);
    }

    public function condition(): HasOne
    {
        return $this->hasOne(PatientCondition::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(PatientContact::class);
    }

    public function insurance(): HasOne
    {
        return $this->hasOne(PatientInsurance::class);
    }

    public function lifestyle(): HasOne
    {
        return $this->hasOne(PatientLifestyle::class);
    }

    public function plans(): HasMany
    {
        return $this->hasMany(PatientContact::class);
    }

    public function activePlans(): HasMany
    {
        return $this->hasMany(PatientPlan::class)
            ->active()
            ->notExpired()
            ->withSessionsRemaining();
    }

    public function doctorAssignments(): HasMany
    {
        return $this->hasMany(DoctorPatientAssignment::class);
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(Doctor::class, 'doctor_patient_assignments')
            ->withPivot(['role', 'started_at', 'ended_at', 'notes', 'meta'])
            ->withTimestamps();
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(Treatment::class);
    }

    public function treatmentSessions(): HasMany
    {
        return $this->hasMany(TreatmentSession::class, 'patient_id', 'id');
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable'); // 1 a 1 polimórfico
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }


    public function pacientes(): HasMany
    {
        return $this->hasMany(PacienteKine::class);
    }

    public function debts(): HasManyThrough
    {
        return $this->hasManyThrough(
            Debt::class,             // related
            TreatmentSession::class, // through
            'patient_id',            // FK en treatment_sessions que apunta a patients.id
            'treatment_session_id',  // FK en debts que apunta a treatment_sessions.id
            'id',                    // PK en patients
            'id'                     // PK en treatment_sessions
        );
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function primaryContact(): HasOne
    {
        return $this->hasOne(PatientContact::class)
            ->orderByDesc('is_primary')   // primero los primarios (true)
            ->orderBy('created_at');      // si no hay primarios, el primero creado
    }

    public function latestAttendance(): HasOne
    {
        return $this->hasOne(Attendance::class)->latestOfMany('attended_at'); // o created_at
    }





    /* ----------Estados y Cálculos------------- */


    public function openDebts()
    {
        return $this->debts()->whereIn('debts.status', [
            Debt::STATUS_PENDING,
            Debt::STATUS_PARTIAL,
            Debt::STATUS_OVERDUE
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }


    /* -------------ATTRIBUTES------------- */

    public function getPaymentStatusAttribute(): string
    {
        // Si la relación ya está cargada en memoria, la usamos para no tocar la BD
        if ($this->relationLoaded('debts')) {
            $activeDebts = $this->debts->whereIn('status', ['pending', 'partial', 'overdue']);

            $overdue = $activeDebts->where('due_date', '<', now()->toDateString())->isNotEmpty();
            if ($overdue) return 'overdue';

            return $activeDebts->isNotEmpty() ? 'due' : 'ok';
        }

        // Si no está cargada, hacemos la consulta SQL específica (con el prefijo de tabla)
        $query = $this->debts()->whereIn('debts.status', ['pending', 'partial', 'overdue']);

        if ((clone $query)->whereDate('due_date', '<', now()->toDateString())->exists()) {
            return 'overdue';
        }

        return $query->exists() ? 'due' : 'ok';
    }


    /* Edad */
    public function age(): Attribute
    {
        return Attribute::make(
            get: fn() => trim(
                $this->birth_date ? $this->birth_date->diffInYears(Carbon::now()) : null,
            ),
        );
    }

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->name . ' ' . $this->last_name
        );
    }

    /* public function paymentLink(): Attribute
    {
        return Attribute::make(
            get: fn () => URL::signedRoute('portal.pago.automatico', ['rut' => $this->rut]),
        );
    } */


    protected function bmi(): Attribute
    {
        return Attribute::make(
            get: function () {

                // 1. Verificación inicial de datos (peso y altura)
                if (!$this->weight || !$this->height) {
                    return null;
                }

                // 2. Normalización de la altura (si está en cm, convertir a metros)
                // Usamos el operador de coalescencia de null (??) para seguridad, aunque ya se verificó.
                $heightRaw = $this->height ?? 0;

                $heightInMeters = $heightRaw > 3
                    ? $heightRaw / 100
                    : $heightRaw;

                // 3. Verificación de seguridad (evitar división por cero)
                if ($heightInMeters <= 0) {
                    return null;
                }

                // 4. Cálculo del IMC: peso / (altura * altura)
                $bmi = $this->weight / ($heightInMeters ** 2);

                // 5. Retorno: Redondear a 1 decimal
                return round($bmi, 1);
            },
        );
    }


    protected $appends = [
        'age',
        'full_name',
        'payment_status',
        'bmi',
    ];
}
