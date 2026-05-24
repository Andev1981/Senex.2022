<?php

namespace App\Services;

use App\Models\{DoctorCommissionRate, TreatmentSession};

class CommissionService
{
  public function computeFor(int $doctorId, int $itemId, float $patientAmount): array
  {
    $rate = DoctorCommissionRate::query()
      ->where('doctor_id', $doctorId)
      ->where('session_type_id', $itemId)
      ->active()
      ->orderByDesc('effective_from')
      ->first();

    if (!$rate) {
      // Intentar buscar una comisión general (session_type_id null)
      $rate = DoctorCommissionRate::query()
        ->where('doctor_id', $doctorId)
        ->whereNull('session_type_id')
        ->active()
        ->orderByDesc('effective_from')
        ->first();
    }

    $isOwn = request()->boolean('is_own_patient') || (isset($ts) && $ts->is_own_patient);

    if ($rate) {
        if ($rate->commission_type === DoctorCommissionRate::TYPE_PERCENTAGE) {
            // Determinar qué porcentaje usar (Propio vs Asignado)
            $percentage = $isOwn 
                ? ($rate->commission_percentage_own ?? $rate->commission_percentage)
                : ($rate->commission_percentage_assigned ?? $rate->commission_percentage);

            $doctor = round($patientAmount * ((float)$percentage / 100), 0);
        } else {
            // Determinar qué monto fijo usar (Propio vs Asignado)
            $doctor = (float) ($isOwn 
                ? ($rate->amount_clp_own ?? $rate->amount_clp)
                : ($rate->amount_clp_assigned ?? $rate->amount_clp));
        }
    } else {
        // FALLBACK: Usar la configuración global del servicio (ServiceDetail)
        $item = \App\Models\Item::with('serviceDetail')->find($itemId);
        $detail = $item?->serviceDetail;

        if (!$detail) {
            return ['doctor_amount_clp' => 0.0, 'clinic_amount_clp' => $patientAmount, 'applied' => null];
        }

        if ($detail->commission_type === 'percentage') {
            $percentage = $isOwn
                ? ($detail->default_doctor_commission_own_percentage ?? $detail->default_doctor_commission_percentage)
                : ($detail->default_doctor_commission_assigned_percentage ?? $detail->default_doctor_commission_percentage);
            
            $doctor = round($patientAmount * ((float)$percentage / 100), 0);
        } else {
            $doctor = (float) ($isOwn
                ? ($detail->default_doctor_commission_own_clp ?? $detail->default_doctor_commission_clp)
                : ($detail->default_doctor_commission_assigned_clp ?? $detail->default_doctor_commission_clp));
        }
    }

    $doctor = max(0, min($doctor, $patientAmount));
    return [
      'doctor_amount_clp' => $doctor,
      'clinic_amount_clp' => $patientAmount - $doctor,
      'applied'       => $rate,
    ];
  }

  public function applyToSession(TreatmentSession $ts): TreatmentSession
  {
    if (!$ts->item_id || !$ts->doctor_id || $ts->patient_amount_clp === null) return $ts;

    $calc = $this->computeFor($ts->doctor_id, $ts->item_id, (float)$ts->patient_amount_clp);
    $ts->doctor_amount_clp = $calc['doctor_amount_clp'];
    $ts->clinic_amount_clp = $calc['clinic_amount_clp'];
    $ts->save();

    return $ts->fresh();
  }
}
