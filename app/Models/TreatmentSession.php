<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TreatmentSession extends Model
{
    use HasFactory, SoftDeletes, Multitenantable, BelongsToTenant;

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_MISSED = 'no_show';

    protected $fillable = [
        'company_id',
        'branch_id',
        'treatment_id',
        'appointment_id', // Puede ser null si es una sesión de emergencia sin cita previa
        'doctor_id',      // Puede ser distinto al del tratamiento (un reemplazo)
        'patient_id',
        'session_type_id',

        // Control
        'date',
        'status',         // scheduled, attended, missed, cancelled
        'consumes_plan',  // boolean (importante para packs de 10 sesiones)

        // La Evolución Clínica (Flexible)
        'pain_level',     // Integer 1-10 (Vale la pena tenerlo en columna propia para gráficas rápidas)
        'evaluation_data', // JSON: Aquí guardas todos los ROMs dinámicos {flexion: 45, extension: 10...}
        'activities_data', // JSON: Aquí guardas técnicas y ejercicios {techniques: [...], exercises: [...]}

        // Notas SOAP
        'subjective',     // "Paciente refiere..."
        'objective',      // "Se observa edema..."
        'assessment',     // "Buena tolerancia al ejercicio..." (Tu actual 'notes')
        'plan',           // "Próxima sesión aumentar carga..." (Tu actual 'homework'/'next_goals')

        // Finanzas (Snapshot)
        'cost_breakdown', // JSON o columnas separadas. Si usas columnas separadas (como tienes ahora) es más fácil sumar con SQL.
        'patient_amount_clp',
        'doctor_amount_clp',
        'clinic_amount_clp',
        'is_exento',
        'dte_generated'
    ];

    // Casts para que Laravel maneje el JSON como Array automáticamente
    protected $casts = [
        'evaluation_data' => 'array',
        'activities_data' => 'array',
        'cost_breakdown' => 'array',
        'consumes_plan' => 'boolean',
        'is_exento' => 'boolean',
        'dte_generated' => 'boolean',
        'date' => 'datetime'
    ];

    /**
     * Relaciones
     */

    // Opción A: Si una sesión SOLO se paga una vez (lo normal)
    public function payrollDetail(): MorphOne
    {
        return $this->morphOne(PayrollDetail::class, 'source');
    }
    
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

    public function dte(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Dte::class, 'origin');
    }

    /**
     * Scopes
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
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
    public function calculateDoctorPayment()
    {
        // 1. Buscamos si hay un trato especial con este doctor
        $specialRate = DoctorCommissionRate::where('doctor_id', $this->doctor_id)
            ->where('session_type_id', $this->session_type_id)
            ->first();

        if ($specialRate) {
            return $specialRate->amount_clp; // Retorna el valor personalizado (ej: 25.000)
        }

        // 2. Si no hay trato especial, retornamos el estándar del servicio
        return $this->sessionType->default_doctor_commission_clp; // Retorna el base (ej: 20.000)
    }

    public function isScheduled(): bool
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function didNotAttend(): bool
    {
        return $this->status === self::STATUS_MISSED;
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);

        // Incrementar sesiones completadas del tratamiento
        if ($this->treatment) {
            $this->treatment->incrementCompletedSessions();
        }
    }

    public function markAsCancelled(): void
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    public function markAsNoShow(): void
    {
        $this->update(['status' => self::STATUS_MISSED]);
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
