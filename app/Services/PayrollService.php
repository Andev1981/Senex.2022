<?php

namespace App\Services;

use App\Models\{Payroll, PayrollDetail, TreatmentSession, Doctor};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayrollService
{
  public function buildForPeriod(int $doctorId, string $fromDate, string $toDate): Payroll
  {
    return DB::transaction(function () use ($doctorId, $fromDate, $toDate) {

      $sessions = TreatmentSession::query()
        ->where('doctor_id', $doctorId)
        ->whereBetween('attended_at', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
        ->where('status', TreatmentSession::STATUS_COMPLETED)
        ->get();

      $payroll = Payroll::query()->create([
        'doctor_id' => $doctorId,
        'period_start' => $fromDate,
        'period_end'   => $toDate,
        'status'       => Payroll::STATUS_DRAFT,
        'total_sessions' => 0,
        'total_patient_amount' => 0,
        'total_doctor_amount'  => 0,
        'total_clinic_amount'  => 0,
      ]);

      foreach ($sessions as $s) {
        PayrollDetail::query()->create([
          'payroll_id'           => $payroll->id,
          'treatment_session_id' => $s->id,
          'session_type_name'    => optional($s->sessionType)->name ?? 'N/D',
          'patient_amount'       => $s->patient_amount ?? 0,
          'doctor_amount'        => $s->doctor_amount ?? 0,
          'commission_rate'      => 0, // si guardas el % aplicado real, setéalo aquí
          'notes'                => null,
        ]);
      }

      $payroll->recalcTotals();

      return $payroll->fresh('details');
    });
  }

  public function approve(Payroll $p): Payroll
  {
    $p->markApproved();
    return $p->fresh();
  }

  public function markPaid(Payroll $p): Payroll
  {
    $p->markPaid();
    return $p->fresh();
  }
}
