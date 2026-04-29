<?php

namespace App\Services;

use App\Models\{DoctorCommissionRate, TreatmentSession};

class CommissionService
{
  public function computeFor(int $doctorId, int $itemId, float $patientAmount): array
  {
    $rate = DoctorCommissionRate::query()
      ->where('doctor_id', $doctorId)
      ->where('item_id', $itemId)
      ->active()
      ->orderByDesc('effective_from')
      ->first();

    if (!$rate) {
      // Intentar buscar una comisión general (item_id null)
      $rate = DoctorCommissionRate::query()
        ->where('doctor_id', $doctorId)
        ->whereNull('item_id')
        ->active()
        ->orderByDesc('effective_from')
        ->first();
    }

    if (!$rate) {
      // fallback simple: 0 para doctor
      return ['doctor_amount_clp' => 0.0, 'clinic_amount_clp' => $patientAmount, 'applied' => null];
    }

    if ($rate->commission_type === DoctorCommissionRate::TYPE_PERCENTAGE) {
      $doctor = round($patientAmount * ((float)$rate->commission_percentage / 100), 0);
    } else {
      $doctor = (float) $rate->amount_clp;
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
