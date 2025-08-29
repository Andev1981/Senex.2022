<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Treatment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'default_session_type_id',
        'diagnosis',
        'planned_sessions',
        'is_indefinite',
        'evaluation_required',
        'status',
        'start_date',
        'end_date',
        'meta',
    ];

    protected $casts = [
        'is_indefinite'       => 'boolean',
        'evaluation_required' => 'boolean',
        'start_date'          => 'date',
        'end_date'            => 'date',
        'meta'                => 'array',
    ];

    /** Estados sugeridos */
    public const STATUS_ACTIVE     = 'active';
    public const STATUS_COMPLETED  = 'completed';
    public const STATUS_PAUSED     = 'paused';
    public const STATUS_INDEFINITE = 'indefinite';
    public const STATUS_CANCELLED  = 'cancelled';

    /* ------------------- Relaciones ------------------- */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function defaultSessionType()
    {
        return $this->belongsTo(SessionType::class, 'default_session_type_id');
    }

    public function sessions()
    {
        return $this->hasMany(TreatmentSession::class);
    }

    /* ------------------- Scopes útiles ------------------- */
    public function scopeActive($q)
    {
        return $q->where('status', self::STATUS_ACTIVE);
    }

    public function scopeForPatient($q, int $patientId)
    {
        return $q->where('patient_id', $patientId);
    }

    public function scopeForDoctor($q, int $doctorId)
    {
        return $q->where('doctor_id', $doctorId);
    }

    /* ------------------- Helpers de negocio ------------------- */

    /** Total de sesiones registradas (completadas o no) */
    public function sessionsCount(): int
    {
        // si tienes status en TreatmentSession, puedes filtrar por 'completed'
        return $this->sessions()->count();
    }

    /** ¿Está abierto para registrar nuevas sesiones? */
    public function isOpen(): bool
    {
        if ($this->status === self::STATUS_CANCELLED || $this->status === self::STATUS_COMPLETED) {
            return false;
        }
        if ($this->is_indefinite) return true;

        return is_null($this->planned_sessions) || $this->sessionsCount() < (int) $this->planned_sessions;
    }

    /** Progreso calculado (para definidos) */
    public function progress(): ?float
    {
        if ($this->is_indefinite || !$this->planned_sessions) return null;
        $done = $this->sessionsCount();
        return $this->planned_sessions > 0 ? round(($done / $this->planned_sessions) * 100, 1) : null;
    }
}
