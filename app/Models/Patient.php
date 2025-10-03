<?php

namespace App\Models;

use App\Models\Concerns\HasAddresses;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory, HasAddresses;

    protected $fillable = [
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
        'notes',
    ];


    protected $casts = [
        'birth_date' => 'date',
        'status_changed_at' => 'datetime',
    ];

    public function doctorAssignments()
    {
        return $this->hasMany(DoctorPatientAssignment::class);
    }

    public function doctors()
    {
        return $this->belongsToMany(Doctor::class, 'doctor_patient_assignments')
            ->withPivot(['role', 'started_at', 'ended_at', 'notes', 'meta'])
            ->withTimestamps();
    }

    public function medicalRecord()
    {
        return $this->hasOne(MedicalRecord::class);
    }

    public function treatments()
    {
        return $this->hasMany(Treatment::class);
    }

    public function treatmentSessions()
    {
        return $this->hasMany(TreatmentSession::class, 'patient_id', 'id');
    }


    public function address()
    {
        return $this->morphOne(Address::class, 'addressable'); // 1 a 1 polimórfico
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }


    public function pacientes()
    {
        return $this->hasMany(PacienteKine::class);
    }

    public function debts()
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

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function getAgeAttribute()
    {
        if (!$this->birth_date) {
            return null;
        }

        /** @var \Carbon\Carbon $date */
        $date = $this->birth_date instanceof Carbon
            ? $this->birth_date
            : Carbon::parse($this->birth_date);

        return $date->age;
    }

    public function getBmiAttribute()
    {
        if (!$this->weight || !$this->height) {
            return null; // si falta dato no calculamos
        }

        // si height está en cm, convertir a metros
        $heightInMeters = $this->height > 3 ? $this->height / 100 : $this->height;

        if ($heightInMeters <= 0) {
            return null;
        }

        $bmi = $this->weight / ($heightInMeters ** 2);

        // redondear a 1 decimal
        return round($bmi, 1);
    }


    public function getPaymentStatusAttribute(): string
    {
        $overdue = $this->debts()
            ->whereIn('debts.status', ['pending', 'partial', 'overdue'])
            ->whereDate('due_date', '<', now()->toDateString())
            ->exists();

        if ($overdue) return 'overdue';

        $hasDue = $this->debts()->whereIn('debts.status', ['pending', 'partial', 'overdue'])->exists();
        return $hasDue ? 'due' : 'ok';
    }


    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function lastAttendance()
    {
        return $this->hasOne(Attendance::class)->latestOfMany('attended_at'); // o created_at
    }

    public function openDebts()
    {
        return $this->debts()->whereIn('debts.status', [
            Debt::STATUS_PENDING,
            Debt::STATUS_PARTIAL,
            Debt::STATUS_OVERDUE
        ]);
    }

    protected $appends = [
        'age',
        'bmi'
    ];
}
