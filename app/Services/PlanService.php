<?php
// app/Services/PlanService.php

namespace App\Services;

use App\Models\Plan;
use App\Models\PatientPlan;
use App\Models\PlanSessionConsumption;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlanService
{
    /**
     * Comprar un plan para un paciente
     */
    public function purchasePlan(int $patientId, int $planId, ?int $paymentId = null): PatientPlan
    {
        return DB::transaction(function () use ($patientId, $planId, $paymentId) {
            $plan = Plan::findOrFail($planId);

            if (!$plan->is_active) {
                throw new \Exception('El plan no está disponible');
            }

            // Calcular fecha de expiración
            $expiryDate = null;
            if ($plan->valid_months) {
                $expiryDate = now()->addMonths($plan->valid_months);
            }

            $patientPlan = PatientPlan::create([
                'patient_id' => $patientId,
                'plan_id' => $planId,
                'payment_id' => $paymentId,
                'purchased_at' => now(),
                'expiry_date' => $expiryDate,
                'sessions_included' => $plan->total_sessions,
                'sessions_used' => 0,
                'status' => 'active',
            ]);

            Log::info('Plan comprado', [
                'patient_plan_id' => $patientPlan->id,
                'patient_id' => $patientId,
                'plan_id' => $planId,
                'sessions_included' => $plan->total_sessions,
                'expiry_date' => $expiryDate,
            ]);

            return $patientPlan;
        });
    }

    /**
     * Verificar si el paciente tiene un plan activo válido para un tipo de sesión
     */
    public function hasActivePlanForSessionType(int $patientId, ?int $sessionTypeId = null): ?PatientPlan
    {
        $query = PatientPlan::where('patient_id', $patientId)
            ->where('status', 'active')
            ->where(function ($q) {
                // No expirado O sin fecha de expiración
                $q->whereNull('expiry_date')
                  ->orWhere('expiry_date', '>=', now());
            })
            ->where(function ($q) {
                // Tiene sesiones disponibles O es ilimitado
                $q->whereNull('sessions_included') // ilimitado
                  ->orWhereRaw('sessions_used < sessions_included');
            });

        $patientPlans = $query->with('plan')->get();

        // Si no hay sessionTypeId, devolver cualquier plan activo
        if (!$sessionTypeId) {
            return $patientPlans->first();
        }

        // Filtrar por tipo de sesión permitido
        foreach ($patientPlans as $patientPlan) {
            $raw = $patientPlan->plan->session_types;

            // Si ya es array, usalo directo; si es string, decodealo
            $allowedSessionTypes = is_array($raw)
                ? $raw
                : (is_string($raw) ? json_decode($raw, true) : []);

            if (empty($allowedSessionTypes) || in_array($sessionTypeId, $allowedSessionTypes)) {
                return $patientPlan;
            }
        }

        return null;
    }

    /**
     * Consumir sesión(es) de un plan
     */
    public function consumeSessionsFromPlan(
        PatientPlan $patientPlan,
        TreatmentSession $session,
        int $sessionsToConsume = 1
    ): PlanSessionConsumption {
        return DB::transaction(function () use ($patientPlan, $session, $sessionsToConsume) {
            // Validar que el plan esté activo
            if ($patientPlan->status !== 'active') {
                throw new \Exception('El plan no está activo');
            }

            // Validar que no esté expirado
            if ($patientPlan->expiry_date && $patientPlan->expiry_date < now()) {
                throw new \Exception('El plan ha expirado');
            }

            // Validar sesiones disponibles (si no es ilimitado)
            if ($patientPlan->sessions_included) {
                $remaining = $patientPlan->sessions_included - $patientPlan->sessions_used;
                if ($remaining < $sessionsToConsume) {
                    throw new \Exception("Solo quedan {$remaining} sesiones disponibles en el plan");
                }
            }

            // Validar tipo de sesión permitido
            $plan = $patientPlan->plan;
            $raw = $plan->session_types;
            $allowedSessionTypes = is_array($raw)
                ? $raw
                : (is_string($raw) ? json_decode($raw, true) : []);

            if (!empty($allowedSessionTypes) && !in_array($session->session_type_id, $allowedSessionTypes)) {
                throw new \Exception('Este tipo de sesión no está incluido en el plan');
            }

            // Registrar consumo
            $consumption = PlanSessionConsumption::create([
                'patient_plan_id' => $patientPlan->id,
                'treatment_session_id' => $session->id,
                'sessions_consumed' => $sessionsToConsume,
                'consumed_at' => now(),
            ]);

            // Actualizar contador
            $patientPlan->increment('sessions_used', $sessionsToConsume);

            // Verificar si se agotó
            if ($patientPlan->sessions_included && 
                $patientPlan->sessions_used >= $patientPlan->sessions_included) {
                $patientPlan->update(['status' => 'exhausted']);
                
                Log::info('Plan agotado', [
                    'patient_plan_id' => $patientPlan->id,
                    'sessions_used' => $patientPlan->sessions_used,
                ]);
            }

            Log::info('Sesión consumida del plan', [
                'consumption_id' => $consumption->id,
                'patient_plan_id' => $patientPlan->id,
                'session_id' => $session->id,
                'sessions_consumed' => $sessionsToConsume,
                'remaining' => $patientPlan->sessions_included - $patientPlan->sessions_used,
            ]);

            return $consumption;
        });
    }

    /**
     * Revertir consumo de sesión (cuando se cancela una sesión)
     */
    public function revertSessionConsumption(TreatmentSession $session): bool
    {
        return DB::transaction(function () use ($session) {
            $consumption = PlanSessionConsumption::where('treatment_session_id', $session->id)
                ->first();

            if (!$consumption) {
                return false; // No había consumo registrado
            }

            $patientPlan = $consumption->patientPlan;

            // Restar del contador
            $patientPlan->decrement('sessions_used', $consumption->sessions_consumed);

            // Si estaba exhausted, volver a active
            if ($patientPlan->status === 'exhausted') {
                $patientPlan->update(['status' => 'active']);
            }

            // Eliminar el registro de consumo
            $consumption->delete();

            Log::info('Consumo de sesión revertido', [
                'patient_plan_id' => $patientPlan->id,
                'session_id' => $session->id,
                'sessions_reverted' => $consumption->sessions_consumed,
            ]);

            return true;
        });
    }

    /**
     * Obtener resumen del plan del paciente
     */
    public function getPatientPlanSummary(int $patientId): array
    {
        $activePlans = PatientPlan::where('patient_id', $patientId)
            ->where('status', 'active')
            ->with('plan')
            ->get();

        return $activePlans->map(function ($patientPlan) {
            $remaining = $patientPlan->sessions_included 
                ? ($patientPlan->sessions_included - $patientPlan->sessions_used)
                : 'Ilimitado';

            $daysUntilExpiry = null;
            if ($patientPlan->expiry_date) {
                $daysUntilExpiry = now()->diffInDays($patientPlan->expiry_date, false);
            }

            return [
                'id' => $patientPlan->id,
                'plan_name' => $patientPlan->plan->name,
                'plan_type' => $patientPlan->plan->type,
                'purchased_at' => $patientPlan->purchased_at->format('Y-m-d'),
                'expiry_date' => $patientPlan->expiry_date?->format('Y-m-d'),
                'days_until_expiry' => $daysUntilExpiry,
                'sessions_included' => $patientPlan->sessions_included ?? 'Ilimitado',
                'sessions_used' => $patientPlan->sessions_used,
                'sessions_remaining' => $remaining,
                'status' => $patientPlan->status,
                'allowed_session_types' => json_decode($patientPlan->plan->session_types, true),
            ];
        })->toArray();
    }

    /**
     * Marcar planes expirados
     */
    public function markExpiredPlans(): int
    {
        $count = PatientPlan::where('status', 'active')
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', now())
            ->update(['status' => 'expired']);

        Log::info('Planes marcados como expirados', ['count' => $count]);

        return $count;
    }

    /**
     * Pausar un plan
     */
    public function pausePlan(PatientPlan $patientPlan, ?string $reason = null): PatientPlan
    {
        if ($patientPlan->status !== 'active') {
            throw new \Exception('Solo se pueden pausar planes activos');
        }

        $patientPlan->update(['status' => 'paused']);

        Log::info('Plan pausado', [
            'patient_plan_id' => $patientPlan->id,
            'reason' => $reason,
        ]);

        return $patientPlan->fresh();
    }

    /**
     * Reactivar un plan pausado
     */
    public function resumePlan(PatientPlan $patientPlan): PatientPlan
    {
        if ($patientPlan->status !== 'paused') {
            throw new \Exception('Solo se pueden reactivar planes pausados');
        }

        // Verificar que no esté expirado
        if ($patientPlan->expiry_date && $patientPlan->expiry_date < now()) {
            throw new \Exception('El plan ha expirado, no se puede reactivar');
        }

        $patientPlan->update(['status' => 'active']);

        Log::info('Plan reactivado', [
            'patient_plan_id' => $patientPlan->id,
        ]);

        return $patientPlan->fresh();
    }

    /**
     * Extender la fecha de expiración de un plan
     */
    public function extendPlanExpiry(PatientPlan $patientPlan, int $additionalMonths): PatientPlan
    {
        $currentExpiry = $patientPlan->expiry_date ?? now();
        $newExpiry = Carbon::parse($currentExpiry)->addMonths($additionalMonths);

        $patientPlan->update([
            'expiry_date' => $newExpiry,
            'status' => 'active', // Reactivar si estaba expired
        ]);

        Log::info('Expiración de plan extendida', [
            'patient_plan_id' => $patientPlan->id,
            'additional_months' => $additionalMonths,
            'new_expiry' => $newExpiry,
        ]);

        return $patientPlan->fresh();
    }

    /**
     * Transferir sesiones entre planes
     */
    public function transferSessions(
        PatientPlan $sourcePlan,
        PatientPlan $targetPlan,
        int $sessionsToTransfer
    ): void {
        DB::transaction(function () use ($sourcePlan, $targetPlan, $sessionsToTransfer) {
            // Validar que el origen tenga suficientes sesiones
            $sourceRemaining = $sourcePlan->sessions_included - $sourcePlan->sessions_used;
            if ($sourceRemaining < $sessionsToTransfer) {
                throw new \Exception("El plan origen solo tiene {$sourceRemaining} sesiones disponibles");
            }

            // Restar del origen
            $sourcePlan->increment('sessions_used', $sessionsToTransfer);

            // Sumar al destino
            if ($targetPlan->sessions_included) {
                $targetPlan->increment('sessions_included', $sessionsToTransfer);
            }

            Log::info('Sesiones transferidas entre planes', [
                'source_plan_id' => $sourcePlan->id,
                'target_plan_id' => $targetPlan->id,
                'sessions_transferred' => $sessionsToTransfer,
            ]);
        });
    }
}