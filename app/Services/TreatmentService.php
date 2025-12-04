<?php
// app/Services/TreatmentService.php

namespace App\Services;

use App\Models\Debt;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TreatmentService
{

    /*  */

     /**
     * Crea un tratamiento, su primera sesión y la deuda asociada de forma transaccional.
     */
    public function createTreatmentWithSession(array $data): Treatment
    {
        // 1. Aseguramos que todas las operaciones se completen o ninguna (Transacción)
        return DB::transaction(function () use ($data) {
            
            // 1.1. Obtener la información necesaria
            $treatment = Treatment::create($data);
            $session_type = SessionType::firstOrFail(); // Usar firstOrFail si debe existir


            // 1.2. Crear la Sesión (usando lógica del Modelo para la numeración)
            $treatment_session = TreatmentSession::create([
                'treatment_id' => $treatment->id,
                'doctor_id' => $treatment->doctor_id,
                'patient_id' => $treatment->patient_id,
                'session_type_id' => $session_type->id,
                // se calcularán usando un Accessor/Mutator en el Modelo.
                // Si la fecha y hora no vienen en el request, se deben manejar.
                'date' => $data['start_date'] ?? null,
                'time' => $data['time'] ?? null,
                'duration' => 45,
                'status' => 'scheduled',
            ]);

            // 2. Llamar a la lógica de resecuenciación para ordenar
            // 1.3. Crear la Deuda
            Debt::create([
                'patient_id' => $treatment->patient_id,
                'treatment_session_id' => $treatment_session->id,
                'original_amount' => $session_type->base_price,
            ]);
            
            $this->resequenceTreatmentSessions($treatment->id);
            return $treatment;
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



    public function createTreatment(array $data): Treatment
    {
        return DB::transaction(function () use ($data) {
            // 1. Crear el tratamiento
      
            $treatment = Treatment::create($data);

            // 2. Crear **todas** las deudas futuras
            $this->createUpcomingDebts($treatment);

            return $treatment;
        });
    }

    
    /**
     * Crear 1 deuda por cada sesión que tendrá el tratamiento
     */
    private function createUpcomingDebts(Treatment $treatment): void
    {
        
        $sessions = $this->generateSessionDates($treatment); // [date, session_type_id]



        foreach ($sessions as $slot) {
            // Usamos el ID que venga en el slot (ya incluye evaluación si aplica)
            $sessionTypeId = $slot['session_type_id'] ?? $treatment->default_session_type_id;
            $sessionType   = SessionType::find($sessionTypeId);

            // Si no hay tipo, usamos precio por defecto
            $amount = $sessionType?->base_price ?? 30000;

            if($treatment->is_indefinite == false){
                // ¿Plan activo que cubra esta sesión?
                $patientPlan = app(PlanService::class)
                    ->hasActivePlanForSessionType(
                        $treatment->patient_id,
                        $sessionTypeId
                    );

                if ($patientPlan && $patientPlan->sessionsRemaining() > 0) {
                    // El plan cubre la sesión, no crear deuda
                    continue;
                }
            }
            

            // Crear deuda (incluye evaluación)
            Debt::create([
                'patient_id'             => $treatment->patient_id,
                'treatment_id'           => $treatment->id,
                'treatment_session_id'   => null, // se asocia al crear la cita
                'original_amount'        => $amount,
                'paid_amount'            => 0,
                'status'                 => 'pending',
                'due_date'               => Carbon::parse($slot['date'])->addDays(7),
                'notes'                  => 'Generada automáticamente al crear tratamiento',
            ]);
        }
    }

    /**
     * Generar array de fechas / tipos de sesión según frecuencia del tratamiento
     */
    private function generateSessionDates(Treatment $treatment): array
    {
        if($treatment->is_indefinite){
            $total   = 1; // sesiones por defecto para tratamientos indefinidos

        }else{
            $total   = $treatment->total_sessions ?? 10; // default
        }
        $freq    = $treatment->frequency ?? 1;
        $freqTime= $treatment->frequency_time ?? 'weekly';
        $start   = Carbon::parse($treatment->start_date) ?? now();

        $slots = [];
        for ($i = 0; $i < $total; $i++) {
             $sessionTypeId = ($i === 0)
            ? SessionType::where('id', 1)->first()->id
            : $treatment->default_session_type_id;

            $date = $freqTime === 'weekly'
                    ? $start->copy()->addWeeks($i * $freq)
                    : $start->copy()->addMonths($i * $freq);

            $slots[] = [
                'date'              => $date->format('Y-m-d'),
                'session_type_id'   => $sessionTypeId, // o lógica propia
            ];
        }
        return $slots;
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
        $flex = $completed->filter(fn ($s) =>
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
        $abd = $completed->filter(fn ($s) =>
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
        $pain = $completed->filter(fn ($s) =>
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
                }else{
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
                return 'treatment';
            } elseif ($percentage > 95 && $percentage < 99){
                return 'rehabilitation';
            }else{
                return 'discharge';
            }
        }

        // Si es indefinido, usar cantidad de sesiones completadas
        if ($treatment->is_indefinite) {
            if ($completedCount <= 5) {
                return 'evaluation';
            } elseif ($completedCount <= 15) {
                return 'treatment';
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
        if (!$treatment->is_indefinite && 
            $treatment->total_sessions && 
            $sessionStats['completed'] >= $treatment->total_sessions) {
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

            // 3. Obtener citas a partir de la última fecha **no cancelada**
            $lastKept = $this->lastNonCancelledSessionDate($treatment);

            // 4. Borrar deudas **no pagadas** posteriores a esa fecha
            Debt::where('treatment_id', $treatment->id)
                ->where('paid_amount', 0)
                ->where('due_date', '>', $lastKept)
                ->delete();

            // 5. Generar nuevas citas y deudas **después** de esa fecha
            $this->createUpcomingDebtsFromDate($treatment, $lastKept);

            // 6. Recalcular campos del tratamiento
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

    private function createUpcomingDebtsFromDate(Treatment $treatment, string $fromDate): void
    {
        $futureSlots = $this->generateSessionDatesFrom($treatment, $fromDate);

        foreach ($futureSlots as $slot) {
            $sessionTypeId = $slot['session_type_id'] ?? $treatment->default_session_type_id;
            $sessionType   = SessionType::find($sessionTypeId);
            $amount        = $sessionType?->price ?? 30000;

            $patientPlan = app(PlanService::class)
                ->hasActivePlanForSessionType($treatment->patient_id, $sessionTypeId);

            if ($patientPlan && $patientPlan->sessionsRemaining() > 0) {
                continue; // plan cubre
            }

            Debt::create([
                'patient_id'           => $treatment->patient_id,
                'treatment_id'         => $treatment->id,
                'treatment_session_id' => null,
                'original_amount'      => $amount,
                'paid_amount'          => 0,
                'status'               => 'pending',
                'due_date'             => Carbon::parse($slot['date'])->addDays(7),
            ]);
        }
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