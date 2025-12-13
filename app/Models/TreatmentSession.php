<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TreatmentSession extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'treatment_id',
        'appointment_id',
        'doctor_id',
        'patient_id',
        'session_type_id',
        'room_id',
        'branch_id',
        'month_session_number',
        'consumes_plan',
        'date',
        'time',
        'duration',
        'status',
        // Evaluación del dolor
        'pain_before',
        'pain_after',
        // ROM (Rango de Movimiento)
        'rom_flexion_before',
        'rom_flexion_after',
        'rom_rotation_before',
        'rom_rotation_after',
        'rom_abduction_before',
        'rom_abduction_after',
        // Arrays
        'techniques',
        'exercises',
        // Notas
        'notes',
        'homework',
        'next_goals',
        // Montos
        'patient_amount', /* base price */
        'doctor_amount', /* Commission */
        'clinic_amount',
        'cancellation_note'
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'duration' => 'integer',
        'pain_before' => 'integer',
        'pain_after' => 'integer',
        'rom_flexion_before' => 'integer',
        'rom_flexion_after' => 'integer',
        'rom_rotation_before' => 'integer',
        'rom_rotation_after' => 'integer',
        'rom_abduction_before' => 'integer',
        'rom_abduction_after' => 'integer',
        'techniques' => 'array',
        'exercises' => 'array',
        'patient_amount' => 'integer',
        'doctor_amount' => 'integer',
        'clinic_amount' => 'integer',
        'month_session_number' => 'integer',
        'consumes_plan' => 'boolean',
    ];

    /**
     * Relaciones
     */
    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function sessionType(): BelongsTo
    {
        return $this->belongsTo(SessionType::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function debt(): HasOne
    {
        return $this->hasOne(Debt::class);
    }

    public function paymentAllocation(): HasOne
    {
        return $this->hasOne(PaymentAllocation::class);
    }

    /**
     * Scopes
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'Programada');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completada');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'Cancelada');
    }

    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeForTreatment($query, $treatmentId)
    {
        return $query->where('treatment_id', $treatmentId);
    }

    /**
     * Accessors & Mutators
     */
    public function getPainImprovementAttribute(): int
    {
        if ($this->pain_before && $this->pain_after) {
            return $this->pain_before - $this->pain_after;
        }
        return 0;
    }

    public function getPainImprovementPercentageAttribute(): float
    {
        if ($this->pain_before && $this->pain_before > 0) {
            return round((($this->pain_before - $this->pain_after) / $this->pain_before) * 100, 1);
        }
        return 0;
    }

    public function getFormattedTimeAttribute(): string
    {
        return $this->time->format('H:i');
    }

    public function getRomAttribute(): array
    {
        return [
            'rom_flexion' => $this->rom_flexion_after ?? $this->rom_flexion_before,
            'rom_abduction' => $this->rom_abduction_after ?? $this->rom_abduction_before,
            'rom_rotation' => $this->rom_rotation_after ?? $this->rom_rotation_before,
        ];
    }

    /**
     * Métodos de utilidad
     */
    public function isScheduled(): bool
    {
        return $this->status === 'Programada';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'Completada';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'Cancelada';
    }

    public function didNotAttend(): bool
    {
        return $this->status === 'No Asistió';
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => 'Completada']);
        
        // Incrementar sesiones completadas del tratamiento
        if ($this->treatment) {
            $this->treatment->incrementCompletedSessions();
        }
    }

    public function markAsCancelled(): void
    {
        $this->update(['status' => 'Cancelada']);
    }

    public function markAsNoShow(): void
    {
        $this->update(['status' => 'No Asistió']);
    }

    public function calculatePainProgress(): float
    {
        if (!$this->pain_before) {
            return 0;
        }

        $improvement = $this->pain_before - ($this->pain_after ?? 0);
        return round(($improvement / $this->pain_before) * 100, 1);
    }

    public function getSessionSummary(): array
    {
        return [
            'id' => $this->id,
            'month_session_number' => $this->month_session_number,
            'date' => $this->date->format('Y-m-d'),
            'time' => $this->formatted_time,
            'duration' => $this->duration,
            'status' => $this->status,
            'doctor' => $this->doctor ? [
                'id' => $this->doctor->id,
                'name' => $this->doctor->name,
            ] : null,
            'pain_metrics' => [
                'before' => $this->pain_before,
                'after' => $this->pain_after,
                'improvement' => $this->pain_improvement,
                'progress' => $this->pain_improvement_percentage,
            ],
            'rom' => $this->rom,
            'techniques' => $this->techniques ?? [],
            'exercises' => $this->exercises ?? [],
            'notes' => $this->notes,
            'homework' => $this->homework,
            'next_goals' => $this->next_goals,
        ];
    }


    /**
     * Generar el próximo número de sesión del mes para el tratamiento
     */
    public static function generateNextMonthSessionNumber(int $treatmentId, string $date): int
    {
        $monthStart = Carbon::parse($date)->startOfMonth()->toDateString();
        $monthEnd = Carbon::parse($date)->endOfMonth()->toDateString();
        
        return (self::where('treatment_id', $treatmentId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->max('month_session_number') ?? 0) + 1;
    }

    /**
     * Calcular y asignar números de sesión al crear
     */
    public function assignSessionNumbers(): void
    {
   

        // Asignar month_session_number si no está presente
        if (!$this->month_session_number && $this->treatment_id && $this->date) {
            $this->month_session_number = self::generateNextMonthSessionNumber(
                $this->treatment_id, 
                $this->date
            );
        }
    }

    /**
     * Recalcular month_session_number cuando cambia la fecha
     */
    public function recalculateMonthSessionNumber(): void
    {
        if ($this->treatment_id && $this->date) {
            $newMonthNumber = self::generateNextMonthSessionNumber(
                $this->treatment_id, 
                $this->date
            );
            
            // Actualizar el número del mes manteniendo el número general
            $this->update(['month_session_number' => $newMonthNumber]);
        }
    }
}
