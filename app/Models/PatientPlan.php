<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientPlan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_id',
        'plan_id',
        'payment_id',
        'purchased_at',
        'start_date',
        'expiry_date',
        'sessions_included',
        'sessions_used',
        'status',
        'notes',
        'paused_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'start_date' => 'date',
        'expiry_date' => 'date',
        'paused_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'sessions_included' => 'integer',
        'sessions_used' => 'integer',
    ];

    // Relaciones
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function consumptions()
    {
        return $this->hasMany(PlanSessionConsumption::class);
    }

    // Accessors
    public function getSessionsRemainingAttribute()
    {
        if ($this->sessions_included === null) {
            return null; // Ilimitado
        }
        return max(0, $this->sessions_included - $this->sessions_used);
    }

    public function getIsExpiredAttribute()
    {
        if (!$this->expiry_date) return false;
        return now()->isAfter($this->expiry_date);
    }

    public function getIsExhaustedAttribute()
    {
        if ($this->sessions_included === null) return false;
        return $this->sessions_used >= $this->sessions_included;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expiry_date')
              ->orWhere('expiry_date', '>=', now());
        });
    }

    public function scopeWithSessionsRemaining($query)
    {
        return $query->where(function($q) {
            $q->whereNull('sessions_included')
              ->orWhereRaw('sessions_used < sessions_included');
        });
    }
}