<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

use App\Enums\AppointmentStatusEnum;

class TreatmentSession extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

 protected $fillable = [
        // --- 1. Contexto y Vinculación ---
        'company_id',
        'branch_id',
        'treatment_id',
        'patient_id',
        'doctor_id',       // Apunta a la tabla 'doctors'
        'item_id',
        'appointment_id',
        'room_id',
        'diagnostic_code',

        // --- 2. Logística ---
        'date',
        'time',
        'status',          // scheduled, checked_in, in_progress, completed...
        'consumes_plan',   // boolean
        'cancellation_note',
        'month_session_number',
        'checked_in_at',
        'started_at',
        'signed_at',

        // --- 3. DATOS CLÍNICOS (SOAP) ---
        // [S]ubjective
        'subjective',
        'pain_level',      // EVA 0-10

        // [O]bjective
        'objective',
        'evaluation_data', // JSON: Mediciones (ROM, Fuerza)
        'session_pain_map',// JSON: Coordenadas del dolor HOY
        'activities_data', // JSON: Ejercicios realizados
        'attachments',     // JSON: Fotos/Docs
        'body_part',       // Nueva adicion para consistencia
        'laterality',      // Nueva adicion para consistencia

        // [A]ssessment
        'assessment',

        // [P]lan
        'plan',

        // --- 4. CAMPOS ADICIONALES PARA DASHBOARD KINE ---
        'pain_before',
        'pain_after',
        'rom_flexion_before',
        'rom_flexion_after',
        'rom_abduction_before',
        'rom_abduction_after',
        'rom_rotation_before',
        'rom_rotation_after',
        'techniques', // JSON
        'exercises',  // JSON
        'notes',
        'homework',
        'next_goals',

        // --- 5. Finanzas ---
        'patient_amount_clp',
        'doctor_amount_clp',
        'clinic_amount_clp',
        'cost_breakdown',   // JSON
        'is_exento',        // boolean
        'dte_generated',    // boolean

        // --- 5. Firma y Validacion ---
        'signature_path',
        'signature_skipped',
        'signature_skip_reason',
        'signed_at',
        'signature_gps_coords',
        'informed_consent_confirmed',

        // --- 6. Extras ---
        'meta',             // JSON
    ];

    /**
     * Los atributos que deben convertirse a tipos nativos.
     * Esto hace que los JSON de la BD se usen como Arrays en PHP.
     */
    protected $casts = [
        'date' => 'date',
        'time' => 'datetime',
        'consumes_plan' => 'boolean',
        'is_exento' => 'boolean',
        'dte_generated' => 'boolean',
        'is_own_patient' => 'boolean',
        'signature_skipped' => 'boolean',
        'informed_consent_confirmed' => 'boolean',
        'checked_in_at' => 'datetime',
        'started_at' => 'datetime',
        'signed_at' => 'datetime',
        'status' => AppointmentStatusEnum::class, // 👈 Casting Mágico
        
        // Arrays (JSONs)
        'techniques' => 'array',
        'exercises' => 'array',
        'evaluation_data' => 'array',
        'session_pain_map' => 'array',
        'activities_data' => 'array',
        'attachments' => 'array',
        'cost_breakdown' => 'array',
        'meta' => 'array',
    ];

    // ==========================================
    // RELACIONES
    // ==========================================

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class, 'treatment_session_id');
    }

    /**
     * El profesional que atendió la sesión.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function diagnostic(): BelongsTo
    {
        return $this->belongsTo(Diagnostic::class, 'diagnostic_code', 'code');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Relación Polimórfica con Signos Vitales.
     * Esto permite: $session->vitalSigns para ver la presión/pulso de ESTA sesión.
     */
    public function vitalSigns(): MorphMany
    {
        return $this->morphMany(VitalSign::class, 'source');
    }

    // Opción A: Si una sesión SOLO se paga una vez (lo normal)
    public function payrollDetail(): MorphOne
    {
        return $this->morphOne(PayrollDetail::class, 'source');
    }
    

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
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
        return $query->where('status', AppointmentStatusEnum::SCHEDULED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', AppointmentStatusEnum::COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', AppointmentStatusEnum::CANCELLED);
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
            ->where('session_type_id', $this->item_id) // Match schema: session_type_id points to items.id
            ->first();

        if ($specialRate) {
            return $specialRate->amount_clp; // Retorna el valor personalizado (ej: 25.000)
        }

        // 2. Si no hay trato especial, retornamos el estándar del servicio
        return $this->item->price ?? 0; // Usamos el precio del ítem como base
    }

    public function isScheduled(): bool
    {
        return $this->status === AppointmentStatusEnum::SCHEDULED;
    }

    public function isCompleted(): bool
    {
        return $this->status === AppointmentStatusEnum::COMPLETED;
    }

    public function isCancelled(): bool
    {
        return $this->status === AppointmentStatusEnum::CANCELLED;
    }

    public function didNotAttend(): bool
    {
        return $this->status === AppointmentStatusEnum::NO_SHOW;
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => AppointmentStatusEnum::COMPLETED]);

        // Incrementar sesiones completadas del tratamiento
        if ($this->treatment) {
            $this->treatment->incrementCompletedSessions();
        }
    }

    public function markAsCancelled(): void
    {
        $this->update(['status' => AppointmentStatusEnum::CANCELLED]);
    }

    public function markAsNoShow(): void
    {
        $this->update(['status' => AppointmentStatusEnum::NO_SHOW]);
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
