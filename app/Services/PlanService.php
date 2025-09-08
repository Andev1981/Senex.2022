<?php

namespace App\Services;

use App\Models\{Patient, PatientPlan, TreatmentSession, Plan};
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use RuntimeException;

class PlanService
{
  /**
   * Selecciona el mejor plan activo del paciente para cubrir un SessionType.
   * Estrategia: el que vence antes (FIFO por expiry).
   */
  public function pickBestActivePlanFor(int $patientId, int $sessionTypeId): ?PatientPlan
  {
    return PatientPlan::query()
      ->where('patient_id', $patientId)
      ->active()->notExpired()
      ->whereHas('plan', fn($q) => $q->where('is_active', true))
      ->get()
      ->filter(fn($pp) => $pp->coversSessionType($sessionTypeId) && $pp->isUsable())
      ->sortBy(fn($pp) => $pp->expiry_date ?? Carbon::parse('2999-12-31'))
      ->first();
  }

  /**
   * Consume N sesiones desde un plan (registra PlanSessionConsumption y actualiza counters).
   */
  public function consumeSessions(PatientPlan $pp, TreatmentSession $ts, int $qty = 1, ?string $notes = null): PatientPlan
  {
    if ($qty <= 0) throw new RuntimeException('Cantidad a consumir inválida.');
    if (!$pp->isUsable()) throw new RuntimeException('El plan no es utilizable (vencido/agotado/pausado).');

    return DB::transaction(function () use ($pp, $ts, $qty, $notes) {
      // registrar consumo
      $pp->consumptions()->create([
        'treatment_session_id' => $ts->id,
        'sessions_consumed'    => $qty,
        'consumed_at'          => $ts->attended_at ?? now(),
        'notes'                => $notes,
      ]);

      // actualizar contador
      $pp->incrementUsage($qty);

      return $pp->fresh();
    });
  }
}
