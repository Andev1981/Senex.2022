<?php

namespace App\Services\Treatments;

use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Services\Plans\PlanService;
use Carbon\Carbon;
use Carbon\Traits\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TreatmentService
{


    /**
     * Crea un tratamiento de forma manual (Desde botón "Nuevo Tratamiento").
     */
    public function createTreatment(array $data): Treatment
    {
        return DB::transaction(function () use ($data) {
            $patientId = $data['patient_id'];

            // ---------------------------------------------------------
            // 1. HIGIENE AUTOMÁTICA (Zombies)
            // ---------------------------------------------------------
            // Cerramos tratamientos abandonados (sin movimiento > 60 días)
            // Esto evita acumular basura histórica.
            Treatment::where('patient_id', $patientId)
                ->whereIn('status', ['evaluation', 'in_progress'])
                ->where('updated_at', '<', now()->subDays(60))
                ->update([
                    'status' => 'interrupted',
                    'outcome' => 'Cierre automático al crear nuevo tratamiento manual.'
                ]);

            // ---------------------------------------------------------
            // 2. PAUSA INTENCIONAL (Controlado por el Usuario)
            // ---------------------------------------------------------
            // Si el frontend envía un checkbox "Pausar tratamientos anteriores", lo obedecemos.
            // Esto es útil si el paciente dice "Ya no vendré por el hombro, ahora veamos la rodilla".
            if (isset($data['should_pause_previous']) && $data['should_pause_previous']) {
                Treatment::where('patient_id', $patientId)
                    ->whereIn('status', ['evaluation', 'in_progress'])
                    ->update(['status' => 'paused']);
            }

            // ---------------------------------------------------------
            // 3. CREACIÓN (Trait se encarga del company_id)
            // ---------------------------------------------------------
            // Aseguramos valores por defecto si no vienen
            $data['status'] = $data['status'] ?? 'evaluation';
            $data['completed_sessions'] = 0;

            // Si es manual, asumimos que el usuario definió 'total_sessions'. 
            // Si no, ponemos un default (ej: 10 sesiones es estándar en bonos).
            $data['total_sessions'] = $data['total_sessions'] ?? 10;

            $treatment = Treatment::create($data);

            return $treatment;
        });
    }

    /**
     * Crea un tratamiento desde una primera sesión.
     */
    public function createTreatmentFromSession(array $data): Treatment
    {
        return DB::transaction(function () use ($data) {

            $patientId = $data['patient_id'];

            // ---------------------------------------------------------
            // PASO 1: LIMPIEZA DE "ZOMBIES" (Higiene de Datos)
            // ---------------------------------------------------------
            // Buscamos tratamientos que quedaron abiertos pero están abandonados
            // Criterio: Sin movimiento (updated_at) hace más de 60 días
            Treatment::where('patient_id', $patientId)
                ->whereIn('status', ['evaluation', 'in_progress'])
                ->where('updated_at', '<', now()->subDays(60)) // 2 meses de inactividad
                ->update([
                    'status' => 'interrupted', // O 'paused'
                    'outcome' => 'Cierre automático por inactividad al abrir nuevo tratamiento.'
                ]);

            // ---------------------------------------------------------
            // PASO 2: BUSCAR ACTIVO (Reutilización)
            // ---------------------------------------------------------
            // Ahora buscamos si queda alguno realmente activo (Reciente)
            $activeTreatment = Treatment::where('patient_id', $patientId)
                ->whereIn('status', ['evaluation', 'in_progress'])
                ->latest('updated_at')
                ->first();

            // Si encontramos uno activo reciente, ASUMIMOS que la sesión es para ese.
            // NOTA: Si el Kine quería uno nuevo para otra lesión, debió crearlo manualmente en el Dashboard.
            // Este método automático asume continuidad por defecto.
            if ($activeTreatment) {
                return $activeTreatment;
            }

            // ---------------------------------------------------------
            // PASO 3: CREAR NUEVO (Si no hay activos recientes)
            // ---------------------------------------------------------
            $description = isset($data['diagnostic_code'])
                ? "Tratamiento Auto ({$data['diagnostic_code']})"
                : "Atención automática " . ($data['date'] ?? date('d-m-Y'));

            return Treatment::create([
                // Trait inyecta company_id / branch_id
                'session_type_id' => $data['session_type_id'] ?? null,
                'patient_id'      => $patientId,
                'doctor_id'       => $data['doctor_id'],
                'start_date'      => $data['date'] ?? now(),
                'status'          => 'evaluation',
                'total_sessions'  => 1, // Por defecto 1 si es auto-creado, o tomar de data si viene
                'completed_sessions' => 0,
                'is_indefinite'   => $data['is_indefinite'] ?? false,
                'current_phase'   => 'evaluation',
                'description'     => $description,
                
                // Diagnóstico y Detalles
                'diagnostic_code' => $data['diagnostic_code'] ?? null,
                'additional_diagnoses' => $data['additional_diagnoses'] ?? null,
                'body_part'       => $data['body_part'] ?? null,
                'laterality'      => $data['laterality'] ?? null,

                // Origen / Derivación (Si viene en el modal)
                'referral_doctor_name' => $data['referral_doctor_name'] ?? null,
                'referral_diagnosis'   => $data['referral_diagnosis'] ?? null,
                'referral_date'        => $data['referral_date'] ?? null,

                // Línea Base (Si se captura en la primera sesión)
                'initial_pain_level' => $data['initial_pain_level'] ?? null,
                'initial_pain_map'   => $data['initial_pain_map'] ?? null,
            ]);
        });
    }

    /**
     * Recalcula y actualiza la numeración de todas las sesiones de un tratamiento.
     */
    protected function resequenceTreatmentSessions(int $treatmentId): void
    {
        // 1. Obtener todas las sesiones para el tratamiento específico, ordenadas cronológicamente
        $sessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        // 2. Iterar y actualizar el número de sesión global
        $monthNumber = 1;
        $currentMonth = null;

        foreach ($sessions as $session) {


            // **Lógica de Sesión Mensual**
            $sessionMonth = \Carbon\Carbon::parse($session->date)->format('Y-m');

            if ($sessionMonth != $currentMonth) {
                $currentMonth = $sessionMonth;
                $monthNumber = 1; // Reiniciar el contador mensual
            }
            $session->month_session_number = $monthNumber++;

            // 3. Guardar el cambio sin disparar eventos innecesarios
            $session->save(['touch' => false]);
        }
    }





    /**
     * Actualizar todos los campos calculados del tratamiento
     */
    public function updateTreatmentCalculatedFields(int $treatmentId): Treatment
    {
        return DB::transaction(function () use ($treatmentId) {
            $treatment = Treatment::findOrFail($treatmentId);

            $updates = [];

            // Actualizar contadores de sesiones
            $sessionStats = $this->calculateSessionStats($treatmentId);
            /* $updates['total_sessions'] = $sessionStats['total']; */
            $updates['completed_sessions'] = $sessionStats['completed'];

            // Actualizar fechas
            $dates = $this->calculateTreatmentDates($treatmentId);
            if ($dates['start_date']) {
                $updates['start_date'] = $dates['start_date'];
            }
            if ($dates['end_date']) {
                $updates['end_date'] = $dates['end_date'];
            }
            $updates['next_appointment'] = $dates['next_appointment'];

            // Actualizar KPIs
            $kpis = $this->calculateTreatmentKPIs($treatmentId);
            $updates['pain_reduction'] = $kpis['pain_reduction'];
            $updates['mobility_improvement'] = $kpis['mobility_improvement'];
            $updates['strength_gain'] = $kpis['strength_gain'];

            // Actualizar fase actual
            $updates['current_phase'] = $this->determineCurrentPhase($treatment, $sessionStats);

            // Actualizar status si es necesario
            $newStatus = $this->determineStatus($treatment, $sessionStats, $dates);
            if ($newStatus) {
                $updates['status'] = $newStatus;
            }

            // Aplicar actualizaciones
            $treatment->update($updates);

            Log::info('Campos del tratamiento actualizados', [
                'treatment_id' => $treatmentId,
                'updates' => array_keys($updates),
            ]);

            return $treatment->fresh();
        });
    }

    /**
     * Calcular estadísticas de sesiones
     */
    private function calculateSessionStats(int $treatmentId): array
    {
        $sessions = TreatmentSession::where('treatment_id', $treatmentId)->get();

        return [
            'total' => $sessions->whereIn('status', ['scheduled', 'completed'])->count(),
            'completed' => $sessions->where('status', 'completed')->count(),
            'scheduled' => $sessions->where('status', 'scheduled')->count(),
            'cancelled' => $sessions->where('status', 'cancelled')->count(),
            'no_show' => $sessions->where('status', 'no_show')->count(),
        ];
    }

    /**
     * Calcular fechas del tratamiento
     */
    private function calculateTreatmentDates(int $treatmentId): array
    {
        $sessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->whereIn('status', ['scheduled', 'completed'])
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        if ($sessions->isEmpty()) {
            return [
                'start_date' => null,
                'end_date' => null,
                'next_appointment' => null,
            ];
        }

        // Start date: primera sesión (programada o completada)
        $startDate = $sessions->first()->date;

        // End date: última sesión completada
        $completedSessions = $sessions->where('status', 'completed');
        $endDate = $completedSessions->isNotEmpty()
            ? $completedSessions->last()->date
            : null;

        // Next appointment: próxima sesión programada en el futuro
        $nextSession = $sessions->filter(function ($session) {
            return $session->status === 'scheduled' && $session->date->isFuture();
        })->first();

        $nextAppointment = null;
        if ($nextSession) {
            $nextAppointment = Carbon::parse($nextSession->date)
                ->setTimeFromTimeString($nextSession->time->format('H:i'));
        }

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'next_appointment' => $nextAppointment,
        ];
    }

    /**
     * Calcular KPIs del tratamiento
     */
    private function calculateTreatmentKPIs(int $treatmentId): array
    {
        $completed = TreatmentSession::where('treatment_id', $treatmentId)
            ->where('status', 'completed')
            ->get();

        $MAX_ROM = 180; // cambiar según articulación

        /* ----------  MOBILITY: FLEXION  ---------- */
        $flex = $completed->filter(
            fn($s) =>
            !is_null($s->rom_flexion_before) && !is_null($s->rom_flexion_after)
        );

        $flexPct = 0;
        if ($flex->isNotEmpty()) {
            $total = 0;
            $count = 0;
            foreach ($flex as $s) {
                $before = $s->rom_flexion_before;
                $after  = $s->rom_flexion_after;
                if ($before >= $MAX_ROM) continue; // evita división 0
                $gain = ($after - $before) / ($MAX_ROM - $before) * 100;
                $total += max(0, min(100, $gain)); // clamp 0-100
                $count++;
            }
            $flexPct = $count ? round($total / $count, 0) : 0;
        }

        /* ----------  MOBILITY: ABDUCTION (ejemplo)  ---------- */
        $abd = $completed->filter(
            fn($s) =>
            !is_null($s->rom_abduction_before) && !is_null($s->rom_abduction_after)
        );

        $abdPct = 0;
        if ($abd->isNotEmpty()) {
            $total = 0;
            $count = 0;
            foreach ($abd as $s) {
                $before = $s->rom_abduction_before;
                $after  = $s->rom_abduction_after;
                if ($before >= $MAX_ROM) continue;
                $gain = ($after - $before) / ($MAX_ROM - $before) * 100;
                $total += max(0, min(100, $gain));
                $count++;
            }
            $abdPct = $count ? round($total / $count, 0) : 0;
        }

        /* ----------  PAIN (sí es porcentual absoluto)  ---------- */
        $pain = $completed->filter(
            fn($s) =>
            !is_null($s->pain_before) && !is_null($s->pain_after)
        );

        $painPct = 0;
        if ($pain->isNotEmpty()) {
            $total = 0;
            foreach ($pain as $s) {
                $before = $s->pain_before; // 0-10
                $after  = $s->pain_after;
                if ($before > 0) {
                    // Cálculo normal de reducción de dolor: (Dolor perdido) / (Dolor inicial) * 100
                    $gain = ($before - $after) / $before * 100;
                } else {
                    $gain = 0;
                }
                $total += max(0, min(100, $gain));
            }
            $painPct = round($total / $pain->count(), 0);
        }



        return [
            'pain_reduction' => max(0, $painPct), // No negativos
            'mobility_improvement' => max(0, $flexPct),
            'strength_gain' => max(0, $abdPct),
        ];
    }

    /**
     * Determinar la fase actual del tratamiento
     */
    private function determineCurrentPhase(Treatment $treatment, array $sessionStats): ?string
    {
        $completedCount = $sessionStats['completed'];

        // Si no tiene sesiones, está en fase inicial
        if ($completedCount === 0) {
            return 'evaluation';
        }

        // Si tiene total_sessions definido, calcular porcentaje
        if ($treatment->total_sessions && $treatment->total_sessions > 0) {
            $percentage = ($completedCount / $treatment->total_sessions) * 100;

            if ($percentage < 33) {
                return 'evaluation';
            } elseif ($percentage < 66) {
                return 'acute_symptomatic';
            } elseif ($percentage > 95 && $percentage < 99) {
                return 'functional_restoration';
            } else {
                return 'discharge';
            }
        }

        // Si es indefinido, usar cantidad de sesiones completadas
        if ($treatment->is_indefinite) {
            if ($completedCount <= 5) {
                return 'evaluation';
            } elseif ($completedCount <= 15) {
                return 'functional_restoration';
            } else {
                return 'discharge';
            }
        }

        return $treatment->current_phase; // Mantener actual si no se puede determinar
    }

    /**
     * Determinar el status del tratamiento
     */
    private function determineStatus(Treatment $treatment, array $sessionStats, array $dates): ?string
    {
        // No cambiar si está suspendido o inactivo manualmente
        if (in_array($treatment->status, ['cancelled', 'completed'])) {
            return null;
        }
        /* 'Evaluation','InProgress','Cancelled','Paused','Completed' */

        // Si no es indefinido y alcanzó el total de sesiones
        if (
            !$treatment->is_indefinite &&
            $treatment->total_sessions &&
            $sessionStats['completed'] >= $treatment->total_sessions
        ) {
            return 'completed';
        }

        // Si la última sesión fue hace más de 60 días y no hay próximas sesiones
        if ($dates['end_date'] && !$dates['next_appointment']) {
            $daysSinceLastSession = Carbon::parse($dates['end_date'])->diffInDays(now());

            if ($daysSinceLastSession > 60) {
                return 'paused';
            }
        }

        // Si tiene sesiones programadas o completadas recientes, está activo
        if ($sessionStats['completed'] > 0 || $sessionStats['scheduled'] > 0) {
            return 'in_progress';
        }

        return null; // No cambiar
    }

    /**
     * Actualizar frecuencia basada en sesiones recientes
     */
    public function updateTreatmentFrequency(int $treatmentId): void
    {
        $treatment = Treatment::findOrFail($treatmentId);

        // Obtener sesiones de los últimos 30 días
        $recentSessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->where('status', 'completed')
            ->where('date', '>=', now()->subDays(30))
            ->orderBy('date')
            ->get();

        if ($recentSessions->count() < 2) {
            return; // No hay suficientes datos
        }

        // Calcular promedio de días entre sesiones
        $intervals = [];
        for ($i = 1; $i < $recentSessions->count(); $i++) {
            $prevDate = Carbon::parse($recentSessions[$i - 1]->date);
            $currDate = Carbon::parse($recentSessions[$i]->date);
            $intervals[] = $prevDate->diffInDays($currDate);
        }

        $avgInterval = round(array_sum($intervals) / count($intervals));

        // Determinar frecuencia
        $frequency = 0;
        $frequencyTime = 'weekly';

        if ($avgInterval <= 2) {
            $frequency = 3; // 3 veces por semana
            $frequencyTime = 'weekly';
        } elseif ($avgInterval <= 4) {
            $frequency = 2; // 2 veces por semana
            $frequencyTime = 'weekly';
        } elseif ($avgInterval <= 7) {
            $frequency = 1; // 1 vez por semana
            $frequencyTime = 'weekly';
        } elseif ($avgInterval <= 14) {
            $frequency = 2; // 2 veces al mes
            $frequencyTime = 'monthly';
        } else {
            $frequency = 1; // 1 vez al mes
            $frequencyTime = 'monthly';
        }

        $treatment->update([
            'frequency' => $frequency,
            'frequency_time' => $frequencyTime,
        ]);

        Log::info('Frecuencia del tratamiento actualizada', [
            'treatment_id' => $treatmentId,
            'frequency' => $frequency,
            'frequency_time' => $frequencyTime,
            'avg_interval_days' => $avgInterval,
        ]);
    }

    /**
     * Actualizar outcome basado en progreso
     */
    public function updateTreatmentOutcome(int $treatmentId, ?string $customOutcome = null): void
    {
        $treatment = Treatment::findOrFail($treatmentId);

        if ($customOutcome) {
            $treatment->update(['outcome' => $customOutcome]);
            return;
        }

        // Generar outcome automático basado en KPIs
        $kpis = $this->calculateTreatmentKPIs($treatmentId);
        $sessionStats = $this->calculateSessionStats($treatmentId);

        if ($sessionStats['completed'] === 0) {
            return;
        }

        $outcome = "Tratamiento con {$sessionStats['completed']} sesiones completadas. ";

        if ($kpis['pain_reduction'] > 0) {
            $outcome .= "Reducción de dolor promedio: {$kpis['pain_reduction']} puntos. ";
        }

        if ($kpis['mobility_improvement'] > 0) {
            $outcome .= "Mejora de movilidad: {$kpis['mobility_improvement']}° en flexión. ";
        }

        if ($kpis['strength_gain'] > 0) {
            $outcome .= "Ganancia de fuerza: {$kpis['strength_gain']}° en abducción. ";
        }

        // Evaluar progreso general
        $avgKPI = ($kpis['pain_reduction'] + $kpis['mobility_improvement'] + $kpis['strength_gain']) / 3;

        if ($avgKPI > 3) {
            $outcome .= "Evolución favorable.";
        } elseif ($avgKPI > 1) {
            $outcome .= "Evolución moderada.";
        } else {
            $outcome .= "Evolución lenta, considerar ajustes al plan.";
        }

        $treatment->update(['outcome' => $outcome]);

        Log::info('Outcome del tratamiento actualizado', [
            'treatment_id' => $treatmentId,
            'outcome' => $outcome,
        ]);
    }


    public function updateTreatmentPlan(Treatment $treatment, array $newData): Treatment
    {
        return DB::transaction(function () use ($treatment, $newData) {
            // 1. Guardar valores anteriores
            $oldTotal = $treatment->total_sessions;
            $oldFreq  = $treatment->frequency;
            $oldFreqT = $treatment->frequency_time;

            // 2. Actualizar tratamiento
            $treatment->update($newData);

            // 3. Recalcular campos del tratamiento
            $this->updateTreatmentCalculatedFields($treatment->id);

            return $treatment->fresh();
        });
    }

    private function lastNonCancelledSessionDate(Treatment $treatment): string
    {
        $session = TreatmentSession::where('treatment_id', $treatment->id)
            ->whereNotIn('status', ['cancelled'])
            ->orderByDesc('date')
            ->first();

        return $session?->date->format('Y-m-d') ?? $treatment->start_date;
    }

    /**
     * Generar fechas de sesiones DESDE una fecha dada
     * (usado después de modificar cantidad o frecuencia)
     */
    private function generateSessionDatesFrom(Treatment $treatment, string $fromDate): array
    {
        $total       = $treatment->total_sessions ?? 10;
        $freq        = $treatment->frequency ?? 1;
        $freqTime    = $treatment->frequency_time ?? 'weekly';
        $start       = Carbon::parse($fromDate)->addDay(); // próxima fecha disponible
        $remaining   = $total - $this->countNonCancelledSessions($treatment); // solo las que faltan

        $slots = [];
        for ($i = 0; $i < $remaining; $i++) {
            $date = $freqTime === 'weekly'
                ? $start->copy()->addWeeks($i * $freq)
                : $start->copy()->addMonths($i * $freq);

            $slots[] = [
                'date'            => $date->format('Y-m-d'),
                'session_type_id' => $treatment->default_session_type_id,
            ];
        }

        return $slots;
    }

    /**
     * Cantidad de sesiones NO canceladas ya creadas
     */
    private function countNonCancelledSessions(Treatment $treatment): int
    {
        return TreatmentSession::where('treatment_id', $treatment->id)
            ->where('status', '!=', 'cancelled')
            ->count();
    }

    /**
     * Verificar y actualizar objetivos cumplidos
     */
    public function checkObjectivesProgress(int $treatmentId): array
    {
        $treatment = Treatment::findOrFail($treatmentId);

        if (!$treatment->objectives) {
            return [];
        }

        $objectives = is_string($treatment->objectives)
            ? json_decode($treatment->objectives, true)
            : $treatment->objectives;

        $kpis = $this->calculateTreatmentKPIs($treatmentId);

        $progress = [];

        foreach ($objectives as $key => $objective) {
            $achieved = false;

            // Ejemplo de objetivos típicos
            if (str_contains(strtolower($objective), 'dolor')) {
                $achieved = $kpis['pain_reduction'] >= 3;
            } elseif (str_contains(strtolower($objective), 'movilidad')) {
                $achieved = $kpis['mobility_improvement'] >= 15;
            } elseif (str_contains(strtolower($objective), 'fuerza')) {
                $achieved = $kpis['strength_gain'] >= 10;
            }

            $progress[$key] = [
                'objective' => $objective,
                'achieved' => $achieved,
            ];
        }

        return $progress;
    }

    /**
     * Generar reporte completo del tratamiento
     */
    public function generateTreatmentReport(int $treatmentId): array
    {
        $treatment = Treatment::with(['patient', 'doctor', 'session_type'])->findOrFail($treatmentId);

        $sessionStats = $this->calculateSessionStats($treatmentId);
        $kpis = $this->calculateTreatmentKPIs($treatmentId);
        $dates = $this->calculateTreatmentDates($treatmentId);
        $objectivesProgress = $this->checkObjectivesProgress($treatmentId);

        return [
            'treatment' => [
                'id' => $treatment->id,
                'name' => $treatment->name,
                'diagnosis' => $treatment->diagnosis,
                'status' => $treatment->status,
                'current_phase' => $treatment->current_phase,
                'is_indefinite' => $treatment->is_indefinite,
            ],
            'patient' => [
                'id' => $treatment->patient->id,
                'name' => $treatment->patient->full_name,
            ],
            'doctor' => [
                'id' => $treatment->doctor->id ?? null,
                'name' => $treatment->doctor->name ?? 'No asignado',
            ],
            'dates' => $dates,
            'session_stats' => $sessionStats,
            'kpis' => $kpis,
            'frequency' => [
                'value' => $treatment->frequency,
                'time' => $treatment->frequency_time,
                'description' => "{$treatment->frequency} {$treatment->frequency_time}",
            ],
            'objectives_progress' => $objectivesProgress,
            'outcome' => $treatment->outcome,
            'completion_percentage' => $treatment->total_sessions
                ? round(($sessionStats['completed'] / $treatment->total_sessions) * 100, 1)
                : null,
        ];
    }
}
