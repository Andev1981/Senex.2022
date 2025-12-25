<?php

namespace App\Services;

use App\Models\{DoctorCommissionRate, TreatmentSession};

class CommissionService
{
  public function computeFor(int $doctorId, int $sessionTypeId, float $patientAmount): array
  {
    $rate = DoctorCommissionRate::query()

      ->where('doctor_id', $doctorId)
      ->where('session_type_id', $sessionTypeId)
      ->active()
      ->orderByDesc('effective_from')
      ->first();

    if (!$rate) {
      // fallback simple: 0 para doctor
      return ['doctor_amount_clp' => 0.0, 'clinic_amount_clp' => $patientAmount, 'applied' => null];
    }

    if ($rate->commission_type === DoctorCommissionRate::TYPE_PERCENTAGE) {
      $doctor = round($patientAmount * ((float)$rate->commission_value / 100), 0);
    } else {
      $doctor = (float) $rate->commission_value;
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
    if (!$ts->session_type_id || !$ts->doctor_id || $ts->patient_amount_clp === null) return $ts;

    $calc = $this->computeFor($ts->doctor_id, $ts->session_type_id, (float)$ts->patient_amount_clp);
    $ts->doctor_amount_clp = $calc['doctor_amount_clp'];
    $ts->clinic_amount_clp = $calc['clinic_amount_clp'];
    $ts->save();

    return $ts->fresh();
  }
}
