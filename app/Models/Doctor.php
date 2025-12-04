<?php

namespace App\Models;

use App\Models\Concerns\HasAddresses;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\DB;

class Doctor extends Model
{
    use HasFactory, HasAddresses;

    protected $fillable = [
        'branch_id',
        'user_id',
        'name',
        'last_name',
        'rut',
        'email',
        'phone',
        'speciality',
        'birth_date',
        'gender',
        'status',
        'mobile_access_enabled',
        'status_reason',
        'status_changed_at'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'status_changed_at' => 'datetime',
        'mobile_access_enabled' => 'boolean',
    ];


    public function patientAssignments()
    {
        return $this->hasMany(DoctorPatientAssignment::class);
    }

    public function patients()
    {
        // sigue sirviendo belongsToMany para consultar “solo pacientes”
          return $this->belongsToMany(Patient::class, 'doctor_patient_assignments')
        ->select('patients.*', DB::raw('patients.id as patient_id'))
        ->withPivot(['role', 'started_at', 'ended_at', 'notes', 'meta'])
        ->withTimestamps();
    }


    public function sessions(){
        return $this->hasMany(TreatmentSession::class);
    }

     public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function commissionRates()
    {
        return $this->hasMany(DoctorCommissionRate::class);
    }

    public function activeCommissionRates()
    {
        return $this->hasMany(DoctorCommissionRate::class)
            ->active()
            ->validAt(now());
    }

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
        /* Attributes */

    public function assignedPatients(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->patients
        );
    }

    public function sessionsMonth(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->sessions()
                            ->whereMonth('date', now()->month)
                            ->whereYear('date', now()->year)
                            ->count()
        );
    }

    public function revenueMonth(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->sessions()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('doctor_amount')
        );
    }



    public function getAgeAttribute()
    {
        if (!$this->birth || !Carbon::hasFormat($this->birth, 'Y-m-d')) {
            return null;
        }

        return Carbon::parse($this->birth)->age . ' años';
    }

    public function getEmailAttribute()
    {
        return $this->user ? $this->user->email : null;
    }

    public function getDireccionAttribute()
    {
        if (!$this->address || !$this->address->address || !$this->address->number) {
            return null;
        }
        if (!$this->address->number) {
            return $this->address->address . ' ' . $this->address->number ?? null;
        }
        return $this->address->address ?? null;
    }

     public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->name . ' ' . $this->last_name
        );
    }

    protected $appends = [
        'age',
        'email',
        'direccion',
        'sessions_month',
        'revenue_month',
        'full_name'
    ];
}
