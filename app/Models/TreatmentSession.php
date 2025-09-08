<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class TreatmentSession extends Model
{


    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'treatment_id',
        'appointment_id',
        'doctor_id',
        'patient_id',
        'session_type_id',
        'attended_at',
        'status',
        'session_number',
        'patient_amount',
        'doctor_amount',
        'clinic_amount',
        'notes',
        'meta',
    ];

    protected $casts = [
        'attended_at'   => 'datetime',
        'patient_amount' => 'decimal:2',
        'doctor_amount' => 'decimal:2',
        'clinic_amount' => 'decimal:2',
        'meta'          => 'array',
    ];

    // ===== Relaciones =====
    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function sessionType()
    {
        return $this->belongsTo(SessionType::class);
    }

    public function payments()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function debt()
    {
        return $this->hasOne(Debt::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function planConsumptions()
    {
        return $this->hasMany(PlanSessionConsumption::class);
    }

    // ===== Scopes =====
    public function scopeCompleted($q)
    {
        return $q->where('status', self::STATUS_COMPLETED);
    }
    public function scopeScheduled($q)
    {
        return $q->where('status', self::STATUS_SCHEDULED);
    }

    // ===== Helpers =====
    public function getIsPaidAttribute(): bool
    {
        if ($this->invoice && $this->invoice->isPaid()) return true;
        if ($this->debt && $this->debt->balance <= 0) return true;
        // también considerar planConsumptions (prepago)
        if ($this->planConsumptions()->exists()) return true;
        // pago directo sin deuda ni invoice
        $sum = $this->payments()->where('status', 'completed')->sum('amount');
        return (float)$sum >= (float)$this->patient_amount;
    }
}
