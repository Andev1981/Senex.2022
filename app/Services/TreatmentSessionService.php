<?php
// app/Services/TreatmentSessionService.php

namespace App\Services;

use App\Models\Debt;
use App\Models\DoctorCommissionRate;
use App\Models\SessionType;
use App\Models\TreatmentSession;
use App\Models\Treatment;
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
            // Validar que exista treatment_id
            if (!isset($data['treatment_id'])) {
                throw new \InvalidArgumentException('treatment_id es requerido');
            }

            // Validar disponibilidad de doctor si se proporciona
            if (isset($data['doctor_id']) && isset($data['date']) && isset($data['time'])) {
                $this->validateDoctorAvailability($data['doctor_id'], $data['date'], $data['time']);
            }

            // Asignar números automáticamente si no vienen en los datos
            if (!isset($data['session_number'])) {
                $data['session_number'] = $this->calculateNextSessionNumber($data['treatment_id']);
            }

            if (!isset($data['month_session_number']) && isset($data['date'])) {
                $data['month_session_number'] = $this->calculateNextMonthSessionNumber(
                    $data['treatment_id'],
                    $data['date']
                );
            }

            $sessionType = SessionType::find($data['session_type_id']);
            $doctorCommission = DoctorCommissionRate::where('session_type_id',$data['session_type_id'])->where('doctor_id',$data['doctor_id'])->first();

            if(!isset($data['patient_amount'])){
                $data['patient_amount'] = $sessionType['base_price'];
            }

            if(!isset($data['doctor_amount_clp'])){
                $data['doctor_amount_clp'] = $doctorCommission['commission_value'];
            }

             if(!isset($data['clinic_amount'])){
                $data['clinic_amount'] = $sessionType['base_price'] - $doctorCommission['commission_value'];
            }



            // Crear la sesión
            $session = TreatmentSession::create($data);

            // === NUEVO BLOQUE: deuda para tratamientos INDEFINIDOS o sin deuda pre-creada ===
            $treatment = Treatment::find($session->treatment_id);

            // Si es indefinido o no hay deuda pre-creada, resolvemos ahora
            if ($treatment->is_indefinite || !Debt::where('treatment_id', $session->treatment_id)
                                                ->whereNull('treatment_session_id')
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
                }
            } else {
                // Tratamiento con total fijo: asociar deuda pre-creada
                $debt = Debt::where('treatment_id', $session->treatment_id)
                            ->whereNull('treatment_session_id')
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
                'session_number' => $session->session_number,
                'month_session_number' => $session->month_session_number,
            ]);

            return $session->fresh();
        });
    }

    /**
     * Actualizar una sesión recalculando números si es necesario
     */
    public function updateSession(TreatmentSession $session, array $data): TreatmentSession
    {
        return DB::transaction(function () use ($session, $data) {

            $oldDate = $session->date;
            $newDate = $data['date'] ?? $oldDate;

            // Si cambió la fecha a un mes diferente, recalcular month_session_number
            if ($oldDate && $newDate) {
                $oldMonth = Carbon::parse($oldDate)->format('Y-m');
                $newMonth = Carbon::parse($newDate)->format('Y-m');

                if ($oldMonth !== $newMonth) {
                    $data['month_session_number'] = $this->calculateNextMonthSessionNumber(
                        $session->treatment_id,
                        $newDate
                    );

                    Log::info('Fecha cambió de mes, recalculando month_session_number', [
                        'session_id' => $session->id,
                        'old_date' => $oldDate,
                        'new_date' => $newDate,
                        'new_month_session_number' => $data['month_session_number'],
                    ]);
                }
            }

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

            $clinicalData['status'] = 'Completada';

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

            $data = ['status' => 'Cancelada'];

            if ($reason) {
                $data['notes'] = ($session->notes ? $session->notes . "\n\n" : '') 
                               . "Motivo de cancelación: {$reason}";
            }

            $session->update($data);

            // Si estaba completada antes, revertir consumo del plan
            if ($oldStatus === 'Completada') {
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
            $session->update(['status' => 'No Asistió']);

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
                $updateData['status'] = 'Programada';
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

            if (!$session->session_number && $session->treatment_id) {
                $updates['session_number'] = $this->calculateNextSessionNumber($session->treatment_id);
            }

            if (!$session->month_session_number && $session->treatment_id && $session->date) {
                $updates['month_session_number'] = $this->calculateNextMonthSessionNumber(
                    $session->treatment_id,
                    $session->date
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
            'completed' => $sessions->where('status', 'Completada')->count(),
            'scheduled' => $sessions->where('status', 'Programada')->count(),
            'cancelled' => $sessions->where('status', 'Cancelada')->count(),
            'no_show' => $sessions->where('status', 'No Asistió')->count(),
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
            'completed' => $sessions->where('status', 'Completada')->count(),
            'scheduled' => $sessions->where('status', 'Programada')->count(),
            'remaining' => $sessions->where('status', 'Programada')->count(),
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
     * Calcular el próximo session_number para un tratamiento
     */
    private function calculateNextSessionNumber(int $treatmentId): int
    {
        $maxNumber = TreatmentSession::where('treatment_id', $treatmentId)
            ->max('session_number');

        return ($maxNumber ?? 0) + 1;
    }

    /**
     * Calcular el próximo month_session_number para un tratamiento en una fecha
     */
    private function calculateNextMonthSessionNumber(int $treatmentId, string $date): int
    {
        $monthStart = Carbon::parse($date)->startOfMonth();
        $monthEnd = Carbon::parse($date)->endOfMonth();

        $maxNumber = TreatmentSession::where('treatment_id', $treatmentId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->max('month_session_number');

        return ($maxNumber ?? 0) + 1;
    }

    /**
     * Validar disponibilidad del doctor en una fecha/hora
     */
    private function validateDoctorAvailability(int $doctorId, string $date, string $time): void
    {
        $exists = TreatmentSession::where('doctor_id', $doctorId)
            ->where('date', $date)
            ->where('time', $time)
            ->whereNotIn('status', ['Cancelada'])
            ->exists();

        if ($exists) {
            throw new \Exception('El doctor no está disponible en ese horario');
        }
    }

    /**
     * Calcular mejora promedio de dolor de una colección de sesiones
     */
    private function calculateAveragePainImprovement(Collection $sessions): ?float
    {
        $completedSessions = $sessions->filter(function ($session) {
            return $session->status === 'Completada' 
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
            return $session->status === 'Completada';
        });

        $attendanceRate = ($attendedSessions->count() / $pastSessions->count()) * 100;

        return round($attendanceRate, 1);
    }
}