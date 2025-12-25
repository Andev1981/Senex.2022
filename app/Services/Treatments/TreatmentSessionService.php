<?php

namespace App\Services\Treatments;

use App\Models\Treatment;
use App\Models\Debt;
use App\Models\Patient;
use App\Jobs\SendPaymentReminderJob;
use App\Models\Doctor;
use App\Models\DoctorCommissionRate;
use App\Models\PatientPlan;
use App\Models\SessionType;
use App\Models\TreatmentSession;
use App\Services\Payments\PaymentService;
use App\Services\Plans\PlanService;
use App\Services\Treatments\TreatmentService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TreatmentSessionService
{
    /**
     * Inyectar servicios dependientes
     */
    public function __construct(
        private PaymentService $paymentService,
        private PlanService $planService,
        private TreatmentService $treatmentService
    ) {}

    /**
     * Crear una nueva sesión con números automáticos
     */
    public function createSession(array $data): TreatmentSession
    {

        return DB::transaction(function () use ($data) {

            $doctor = Doctor::findOrFail($data['doctor_id']);

            // Validar disponibilidad de doctor si se proporciona
            if (isset($data['doctor_id']) && isset($data['date']) && isset($data['time'])) {
                $this->validateDoctorAvailability($data['doctor_id'], $data['date'], $data['time']);
            }

            $sessionType = SessionType::findOrFail($data['session_type_id']);

            $doctorCommission = DoctorCommissionRate::active()
                ->forDoctor($data['doctor_id'])
                ->forSessionType($data['session_type_id'])
                ->validAt(Carbon::parse($data['date']))
                ->first();


            if (!$doctorCommission) {
                DB::rollBack();
                // 🎯 LANZAR EXCEPCIÓN: Esto detiene la transacción y la ejecución.
                throw new \Exception(
                    "⚠️ No hay comisión configurada para {$doctor->full_name} en sesiones de tipo '{$sessionType->name}'. " .
                        "Por favor, configure la comisión antes de agendar. o revise la fecha ingresada!"
                );
            }

            // Si la comisión existe pero no tiene valores
            if ($doctorCommission->commission_type === 'percentage' && !$doctorCommission->commission_percentage) {
                DB::rollBack();
                // 🎯 LANZAR EXCEPCIÓN: Esto detiene la transacción y la ejecución.
                throw new \Exception(
                    "⚠️ La comisión de {$doctor->full_name} no tiene porcentaje asignado. " .
                        "Configure el valor antes de continuar."
                );
            }

            if ($doctorCommission->commission_type === 'fixed_amount' && !$doctorCommission->commission_value) {
                DB::rollBack();
                // 🎯 LANZAR EXCEPCIÓN: Esto detiene la transacción y la ejecución.
                throw new \Exception(
                    "⚠️ La comisión de {$doctor->full_name} no tiene monto fijo asignado. " .
                        "Configure el valor antes de continuar."
                );
            }

            if (!isset($data['patient_amount_clp'])) {
                $data['patient_amount_clp'] = $sessionType['base_price_clp'];
            }
            if (!isset($data['doctor_amount_clp'])) {
                $data['doctor_amount_clp'] = $doctorCommission['amount_clp'];
            }

            if (!isset($data['clinic_amount_clp'])) {
                $data['clinic_amount_clp'] = $sessionType['base_price_clp'] - $doctorCommission['amount_clp'];
            }

            // ============================================
            // 1.- Asignar paciente a doctor
            // ============================================
            $this->assignPatientToDoctor($data['patient_id'], $data['doctor_id']);

            // ============================================
            // 2.- Buscar o crear tratamiento
            // ============================================
            if (!isset($data['treatment_id'])) {
                $treatment = $this->treatmentService->createTreatmentFromSession($data);
                $data['treatment_id'] = $treatment->id;
            }

            if (!isset($data['month_session_number'])) {
                // 1. Calcular el número temporal para la nueva sesión (solo para cumplir el NOT NULL de la DB)
                $maxExisting = $this->getCurrentMaxSessionNumber($data['treatment_id'], $data['date']);
                $data['month_session_number'] = $maxExisting + 1;
            } else {
                $maxExisting = $this->getCurrentMaxSessionNumber($data['treatment_id'], $data['date']);
                $data['month_session_number'] = $maxExisting + 1;
            }

            // ============================================
            // 3.- Calcular y guardar snapshot de comisión
            // ============================================
            $data['commission_amount_clp'] = $doctorCommission->calculateCommission($data['patient_amount_clp']);
            $data['commission_percentage'] = $doctorCommission->commission_percentage;
            $data['commission_type'] = $doctorCommission->commission_type;

            // ============================================
            // 4. Verificar y validar plan (si aplica)
            // ============================================
            $consumePlan = $data['consume_plan'] ?? false;
            $patientPlan = null;

            if ($consumePlan) {
                if (!$data['patient_plan_id']) {
                    DB::rollBack();
                    throw new \Exception(
                        'Debe seleccionar un plan para consumir'
                    );
                }

                // Buscar plan con scopes
                $patientPlan = PatientPlan::where('id', $data['patient_plan_id'])
                    ->where('patient_id', $data['patient_id'])
                    ->active()
                    ->notExpired()
                    ->withSessionsRemaining()
                    ->first();

                if (!$patientPlan) {
                    DB::rollBack();
                    throw new \Exception(
                        "⚠️ El plan seleccionado no está disponible o ha expirado"
                    );
                }

                // Verificar que tenga sesiones disponibles
                if ($patientPlan->sessions_remaining <= 0) {
                    DB::rollBack();
                    throw new \Exception(
                        "⚠️ El plan no tiene sesiones disponibles"
                    );
                }

                // Verificar tipos de sesión permitidos en el plan
                $plan = $patientPlan->plan;
                if ($plan->session_types) {
                    $allowedTypes = $plan->session_types; // Ya es array, no necesita json_decode

                    if (count($allowedTypes) > 0 && !in_array($data['session_type_id'], $allowedTypes)) {
                        DB::rollBack();
                        throw new \Exception(
                            "⚠️ El tipo de sesión seleccionado no está cubierto por este plan"
                        );
                    }
                }
            }

            if ($patientPlan) {
                Log::info("Plan válido para consumir", [
                    'patient_plan_id' => $patientPlan->id,
                    'plan_name' => $patientPlan->plan->name,
                    'sessions_remaining' => $patientPlan->sessions_remaining,
                ]);
            } else {
                Log::info("No se consumirá plan para esta sesión");
            }

            // 2. Crear/Guardar el nuevo registro en la base de datos (¡El dato ya existe!)
            $session = TreatmentSession::create($data);

            // 3. RECÁLCULO COMPLETO: Llamar a la función para ordenar todas las sesiones de ese mes.
            $this->resequenceMonthSessions($session->treatment_id, $session->date);

            // Re-obtener el paciente (necesario para el Job)
            $patient = Patient::find($session->patient_id); // Asumo que tienes el modelo Patient

            // === NUEVO BLOQUE: deuda para tratamientos INDEFINIDOS o sin deuda pre-creada ===
            $treatment = Treatment::find($session->treatment_id);

            // Si es indefinido o no hay deuda pre-creada, resolvemos ahora
            if ($treatment->is_indefinite || !Debt::where('treatment_session_id', $session->id)
                ->exists()) {

                $patientPlan = $this->planService->hasActivePlanForSessionType(
                    $session->patient_id,
                    $session->session_type_id
                );

                if ($patientPlan && $patientPlan->sessionsRemaining() > 0 && !$treatment->is_indefinite) {
                    $this->planService->consumeSessionsFromPlan($patientPlan, $session);
                } else {
                    // Crear deuda en el momento
                    $this->paymentService->createDebtForSession($session);

                    // --- [LÓGICA DE NOTIFICACIÓN] ---
                    $totalDeuda = (int) $session->patient_amount_clp; // Usamos el monto de la sesión
                    $session_type = $sessionType['name'];
                    $treatment_session = $session;

                    if ($patient && $totalDeuda > 0) {
                        Log::info('Paciente y deuda, listos para enviar whatsapp!!!');
                        SendPaymentReminderJob::dispatch(
                            $patient,
                            $treatment_session,
                            $session_type,
                            $totalDeuda,
                            1, // Es 1 ítem (la sesión recién creada)
                            ['whatsapp'] // Disparamos a los canales permitidos
                        )->delay(now()->addMinutes(15)); // Retardo de gracia de 15 minutos

                        Log::info('Job de recordatorio despachado tras crear sesión.', ['session_id' => $session->id]);
                    }
                }
            } else {
                // Tratamiento con total fijo: asociar deuda pre-creada
                $debt = Debt::where('treatment_session_id',  $session->treatment_id)
                    ->whereDate('due_date', '>=', $session->date)
                    ->orderBy('due_date')
                    ->first();

                if ($debt) {
                    $debt->update(['treatment_session_id' => $session->id]);
                }
            }

            // 3. Seguir tu flujo normal
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);

            Log::info('Sesión creada', [
                'session_id' => $session->id,
                'treatment_id' => $session->treatment_id,
                'month_session_number' => $session->month_session_number,
            ]);

            return $session->fresh();
        });
    }

    /**
     * Asigna un paciente a un doctor si no está asignado
     */
    private function assignPatientToDoctor($patientId, $doctorId)
    {
        $exists = DB::table('doctor_patient_assignments')
            ->where('patient_id', $patientId)
            ->where('doctor_id', $doctorId)
            ->exists();

        if (!$exists) {
            DB::table('doctor_patient_assignments')->insert([
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Paciente asignado a doctor", [
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
            ]);
        }
    }

    /**
     * Validar disponibilidad del doctor en una fecha/hora
     */
    private function validateDoctorAvailability(int $doctorId, string $date, string $time): void
    {
        $exists = TreatmentSession::where('doctor_id', $doctorId)
            ->where('date', $date)
            ->where('time', $time)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($exists) {
            throw new \Exception('El doctor no está disponible en ese horario');
        }
    }

    /**
     * Actualizar una sesión recalculando números si es necesario
     */
    public function updateSession(TreatmentSession $session, array $data): TreatmentSession
    {
        return DB::transaction(function () use ($session, $data) {

            $oldDate = $session->date;
            $newDate = $data['date'] ?? $oldDate;
            $status = $data['status'];
            $debt = Debt::where('treatment_session_id', $session->id)->first();

            if ($status === "cancelled" || $status === "not_attend") {

                if ($debt) {
                    $debt->delete();
                }

                $data['month_session_number'] = 0;
                $session->update($data);
            } else {
                $data['month_session_number'] = 1;
                $session->update($data);
            }

            if (!$debt) {
                $this->paymentService->createDebtForSession($session);
            }

            $this->resequenceMonthSessions(
                $session->treatment_id,
                $newDate,
            );

            // Actualizar la sesión
            $session->update($data);

            $session->fresh()->status;

            // ⚡ ACTUALIZAR TRATAMIENTO
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);

            Log::info('Sesión actualizada', [
                'session_id' => $session->id,
                'updated_fields' => array_keys($data),
            ]);

            return $session->fresh();
        });
    }

    public function deleteSession(TreatmentSession $session)
    {
        return DB::transaction(function () use ($session) {

            $oldDate = $session->date;
            $newDate = $data['date'] ?? $oldDate;
            $treatment = $session->treatment_id;
            $debt = Debt::where('treatment_session_id', $session->id)->first();

            if ($debt) {
                $debt->delete();
            }

            // Actualizar la sesión
            $session->delete();

            // Si cambió la fecha a un mes diferente, recalcular month_session_number
            if ($session->treatment_id) {

                $this->resequenceMonthSessions(
                    $treatment,
                    $newDate,
                );

                Log::info('Resecuencia: ', [
                    'session_id' => $session->id
                ]);
            }

            return;
        });
    }
    /**
     * Completar sesión con datos clínicos
     */
    public function completeSession(TreatmentSession $session, array $clinicalData): TreatmentSession
    {
        return DB::transaction(function () use ($session, $clinicalData) {
            // Validar que no esté ya completada
            if ($session->isCompleted()) {
                throw new \Exception('La sesión ya está completada');
            }

            $clinicalData['status'] = 'completed';

            // Actualizar la sesión con datos clínicos
            $session->update($clinicalData);

            // ⚡ ACTUALIZAR TRATAMIENTO COMPLETO
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);
            $this->treatmentService->updateTreatmentFrequency($session->treatment_id);
            $this->treatmentService->updateTreatmentOutcome($session->treatment_id);

            // Manejar pago/deuda automáticamente
            $this->handleSessionPayment($session);

            Log::info('Sesión completada', [
                'session_id' => $session->id,
                'treatment_id' => $session->treatment_id,
                'pain_improvement' => $session->pain_improvement ?? null,
            ]);

            return $session->fresh();
        });
    }

    /**
     * Cancelar una sesión
     */
    public function cancelSession(TreatmentSession $session, ?string $reason = null): TreatmentSession
    {
        return DB::transaction(function () use ($session, $reason) {
            if ($session->isCompleted()) {
                throw new \Exception('No se puede cancelar una sesión completada');
            }

            $oldStatus = $session->status;

            $data = ['status' => 'cancelled'];

            if ($reason) {
                $data['notes'] = ($session->notes ? $session->notes . "\n\n" : '')
                    . "Motivo de cancelación: {$reason}";
            }

            $session->update($data);

            // Si estaba completada completed, revertir consumo del plan
            if ($oldStatus === 'completed') {
                $this->planService->revertSessionConsumption($session);
            }

            // ⚡ ACTUALIZAR TRATAMIENTO
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);

            Debt::where('treatment_session_id', $session->id)
                ->where('paid_amount', 0)
                ->where('status', 'pending')
                ->delete();

            Log::info('Sesión cancelada', [
                'session_id' => $session->id,
                'reason' => $reason,
            ]);

            return $session->fresh();
        });
    }

    /**
     * Marcar sesión como no asistida
     */
    public function markAsNoShow(TreatmentSession $session): TreatmentSession
    {
        return DB::transaction(function () use ($session) {
            if (!$session->isPast() && !$session->isToday()) {
                throw new \Exception('Solo se puede marcar como no asistió sesiones pasadas o del día');
            }

            $oldStatus = $session->status;
            $session->update(['status' => 'not_attend']);

            // ⚡ ACTUALIZAR TRATAMIENTO
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);

            Log::info('Sesión marcada como no asistió', [
                'session_id' => $session->id,
            ]);

            return $session->fresh();
        });
    }

    /**
     * Reprogramar sesión
     */
    public function rescheduleSession(
        TreatmentSession $session,
        string $newDate,
        ?string $newTime = null
    ): TreatmentSession {
        return DB::transaction(function () use ($session, $newDate, $newTime) {
            if ($session->isCompleted()) {
                throw new \Exception('No se puede reprogramar una sesión completada');
            }

            // Validar disponibilidad
            if ($newTime && $session->doctor_id) {
                $this->validateDoctorAvailability($session->doctor_id, $newDate, $newTime);
            }

            $updateData = ['date' => $newDate];

            if ($newTime) {
                $updateData['time'] = $newTime;
            }

            // Si estaba cancelada, volver a programar
            if ($session->isCancelled()) {
                $updateData['status'] = 'shceduled';
            }

            $session = $this->updateSession($session, $updateData);

            // ⚡ ACTUALIZAR next_appointment del tratamiento
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);

            Log::info('Sesión reprogramada', [
                'session_id' => $session->id,
                'new_date' => $newDate,
                'new_time' => $newTime,
            ]);

            return $session;
        });
    }

    /**
     * Asignar números a una sesión existente
     */
    public function assignSessionNumbers(TreatmentSession $session): TreatmentSession
    {
        return DB::transaction(function () use ($session) {
            $updates = [];

            if (!$session->month_session_number && $session->treatment_id && $session->date) {
                $this->resequenceMonthSessions(
                    $session->treatment_id,
                    $session->date,
                );
            }

            if (!empty($updates)) {
                $session->update($updates);

                Log::info('Números de sesión asignados', [
                    'session_id' => $session->id,
                    'updates' => $updates,
                ]);
            }

            return $session->fresh();
        });
    }

    /**
     * Crear múltiples sesiones de forma eficiente
     */
    public function createBulkSessions(array $sessionsData): Collection
    {
        $sessions = collect();

        DB::transaction(function () use ($sessionsData, &$sessions) {
            foreach ($sessionsData as $data) {
                $sessions->push($this->createSession($data));
            }
        });

        Log::info('Sesiones bulk creadas', [
            'count' => $sessions->count(),
        ]);

        return $sessions;
    }

    /**
     * Obtener resumen de sesiones de un tratamiento
     */
    public function getTreatmentSessionsSummary(int $treatmentId): array
    {
        $sessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->with(['doctor', 'sessionType'])
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        return [
            'total' => $sessions->count(),
            'completed' => $sessions->where('status', 'completed')->count(),
            'scheduled' => $sessions->where('status', 'scheduled')->count(),
            'cancelled' => $sessions->where('status', 'cancelled')->count(),
            'not_attend' => $sessions->where('status', 'not_attend')->count(),
            'average_pain_improvement' => $this->calculateAveragePainImprovement($sessions),
            'attendance_rate' => $this->calculateAttendanceRate($sessions),
            'sessions' => $sessions->map(fn($s) => $s->getSessionSummary()),
        ];
    }

    /**
     * Obtener estadísticas del mes actual
     */
    public function getCurrentMonthStats(int $treatmentId): array
    {
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $sessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->get();

        return [
            'month' => $monthStart->format('Y-m'),
            'total_sessions' => $sessions->count(),
            'completed' => $sessions->where('status', 'completed')->count(),
            'scheduled' => $sessions->where('status', 'scheduled')->count(),
            'remaining' => $sessions->whereIn('status', ['scheduled', 'completed'])->count(),
            'attendance_rate' => $this->calculateAttendanceRate($sessions),
        ];
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Manejar pago/deuda al completar sesión
     */
    private function handleSessionPayment(TreatmentSession $session): void
    {
        // Verificar si tiene plan activo para este tipo de sesión
        $patientPlan = $this->planService->hasActivePlanForSessionType(
            $session->patient_id,
            $session->session_type_id
        );

        if ($patientPlan) {
            try {
                // Intentar consumir sesión del plan
                $this->planService->consumeSessionsFromPlan($patientPlan, $session);

                Log::info('Sesión cubierta por plan', [
                    'session_id' => $session->id,
                    'patient_plan_id' => $patientPlan->id,
                ]);

                return; // No crear deuda
            } catch (\Exception $e) {
                Log::warning('No se pudo consumir del plan, generando deuda', [
                    'session_id' => $session->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Sin plan o plan agotado: crear deuda
        $this->paymentService->createDebtForSession($session);
    }

    /**
     * Calcular el próximo month_session_number para un tratamiento en una fecha
     */
    private function getCurrentMaxSessionNumber(int $treatmentId, string $date): int
    {
        $carbonDate = Carbon::parse($date);
        $monthStart = $carbonDate->copy()->startOfMonth();
        $monthEnd = $carbonDate->copy()->endOfMonth();

        return TreatmentSession::where('treatment_id', $treatmentId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->max('month_session_number') ?? 0;
    }

    public function resequenceMonthSessions(int $treatmentId, string $date): void
    {
        $carbonDate = Carbon::parse($date);
        $monthStart = $carbonDate->copy()->startOfMonth();
        $monthEnd = $carbonDate->copy()->endOfMonth();

        // 1. Traer todas las sesiones del mes/tratamiento, ordenadas por fecha y hora.
        $sessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->whereIn('status', ['scheduled', 'completed', 'in_progress'])
            ->orderBy('date', 'asc') // CRUCIAL: Ordenar por fecha cronológica
            ->orderBy('time', 'asc') // CRUCIAL: Ordenar por fecha cronológica
            ->get();

        // 2. Iniciar la secuencia.
        $sequence = 1;

        // 3. Iterar y actualizar secuencialmente.
        // Usar transacciones para asegurar la atomicidad de los updates.
        DB::transaction(function () use ($sessions, &$sequence) {
            foreach ($sessions as $session) {
                // Solo actualiza si el número es diferente para evitar updates innecesarios.
                if ($session->month_session_number !== $sequence) {
                    // Usamos save() para aprovechar los mutators de Eloquent, 
                    // o usar update() para mayor velocidad. Usaremos save() por simplicidad.
                    $session->month_session_number = $sequence;
                    $session->save(['touch' => false]); // Usar ['touch' => false] evita actualizar timestamps de la sesión.
                }
                $sequence++;
            }
        });
    }

    /**
     * Calcular mejora promedio de dolor de una colección de sesiones
     */
    private function calculateAveragePainImprovement(Collection $sessions): ?float
    {
        $completedSessions = $sessions->filter(function ($session) {
            return $session->status === 'completed'
                && !is_null($session->pain_before)
                && !is_null($session->pain_after);
        });

        if ($completedSessions->isEmpty()) {
            return null;
        }

        $totalImprovement = $completedSessions->sum(function ($session) {
            return $session->pain_before - $session->pain_after;
        });

        $average = $totalImprovement / $completedSessions->count();

        return round($average, 1);
    }

    /**
     * Calcular tasa de asistencia (porcentaje de sesiones asistidas)
     */
    private function calculateAttendanceRate(Collection $sessions): float
    {
        // Solo contar sesiones que ya pasaron
        $pastSessions = $sessions->filter(function ($session) {
            return Carbon::parse($session->date)->isPast();
        });

        if ($pastSessions->isEmpty()) {
            return 0;
        }

        // Contar sesiones completadas (asistidas)
        $attendedSessions = $pastSessions->filter(function ($session) {
            return $session->status === 'completed';
        });

        $attendanceRate = ($attendedSessions->count() / $pastSessions->count()) * 100;

        return round($attendanceRate, 1);
    }
}
