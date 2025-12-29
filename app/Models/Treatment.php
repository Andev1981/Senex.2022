<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Treatment extends Model
{
    use HasFactory, SoftDeletes, Multitenantable, BelongsToTenant;

    protected $fillable = [
        'company_id',
        'branch_id',
        'session_type_id',
        'default_session_type_id',
        'patient_id',
        'doctor_id',
        'diagnostic_code',
        'description',
        'start_date',
        'end_date',
        'status',
        'total_sessions',
        'completed_sessions',
        'frequency',
        'frequency_time',
        'is_indefinite',
        'current_phase',
        'objectives',
        'outcome',
        'next_appointment',
        // KPIs
        'pain_reduction',
        'mobility_improvement',
        'strength_gain',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'next_appointment' => 'datetime',
        'objectives' => 'array',
        'is_indefinite' => 'boolean',
        'total_sessions' => 'integer',
        'completed_sessions' => 'integer',
        'pain_reduction' => 'integer',
        'mobility_improvement' => 'integer',
        'strength_gain' => 'integer',
    ];

    /**
     * Relaciones
     */
    public function diagnostic(): BelongsTo
    {
        return $this->belongsTo(Diagnostic::class, 'diagnostic_code', 'code');
    }

    public function sessionType(): BelongsTo
    {
        return $this->belongsTo(SessionType::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TreatmentSession::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    /**
     * Scopes
     */
    public function scopeEvaluation($query)
    {
        return $query->where('status', 'Evaluation');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'InProgress');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'Cancelled');
    }

    public function scopePaused($query)
    {
        return $query->where('status', 'Paused');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Accessors & Mutators
     */
    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_sessions && $this->total_sessions > 0) {
            return round(($this->completed_sessions / $this->total_sessions) * 100, 1);
        }
        return 0;
    }

    public function getNextSessionNumberAttribute(): int
    {
        return ($this->completed_sessions ?? 0) + 1;
    }

    /**
     * Métodos de utilidad
     */
    public function isCompleted(): bool
    {
        return $this->status === 'Completado';
    }

    public function isActive(): bool
    {
        return $this->status === 'Activo';
    }

    public function incrementCompletedSessions(): void
    {
        $this->increment('completed_sessions');

        // Si completó todas las sesiones, marcar como completado
        if ($this->completed_sessions >= $this->total_sessions) {
            $this->update(['status' => 'Completado']);
        }
    }

    public function calculateKPIs(): array
    {
        $sessions = $this->sessions()->completed()->get();

        if ($sessions->isEmpty()) {
            return [
                'pain_reduction' => 0,
                'mobility_improvement' => 0,
                'strength_gain' => 0,
            ];
        }

        $totalPainReduction = 0;
        $totalMobilityImprovement = 0;
        $totalStrengthGain = 0;

        foreach ($sessions as $session) {
            if ($session->pain_before && $session->pain_after) {
                $totalPainReduction += (($session->pain_before - $session->pain_after) / $session->pain_before) * 100;
            }
            // ROM y otros KPIs se calcularían aquí según el tipo de tratamiento
        }

        $count = $sessions->count();

        return [
            'pain_reduction' => round($totalPainReduction / $count, 1),
            'mobility_improvement' => round($totalMobilityImprovement / $count, 1),
            'strength_gain' => round($totalStrengthGain / $count, 1),
        ];
    }
}
