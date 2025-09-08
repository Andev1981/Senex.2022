<?php

namespace App\Services;

use App\Models\{
  Treatment,
  TreatmentSession,
  Appointment,
  Patient,
  Doctor,
  SessionType,
  Debt
};
use App\Services\{CommissionService, PlanService, PaymentService, InvoiceService};
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TreatmentSessionService
{
  public function __construct(
    protected CommissionService $commission,
    protected PlanService $plans,
    protected PaymentService $payments,
    protected InvoiceService $invoices,
  ) {}

  /**
   * Registrar atención (puede venir con appointment o sin).
   *
   * @param  array  $payload  [
   *   patient_id, doctor_id, session_type_id,
   *   treatment_id (nullable), appointment_id (nullable),
   *   attended_at (nullable), patient_amount (nullable => usa base_price),
   *   notes (nullable),
   *   payment: ['mode'=>'now'|'debt'|'planOnly', 'method'=>'webpay'|'cash'|'transfer' ...],
   *   dte: ['issue'=>bool, 'type'=>'boleta'|'factura']
   * ]
   */
  public function registerAttendance(array $payload): TreatmentSession
  {

    $patientId = (int)($payload['patient_id'] ?? 0);
    $doctorId  = (int)($payload['doctor_id'] ?? 0);
    $sessionTypeId = (int)($payload['session_type_id'] ?? 0);

    if (!$patientId || !$doctorId || !$sessionTypeId) {
      throw new RuntimeException('Datos insuficientes para registrar atención.');
    }

    return DB::transaction(function () use ($payload, $patientId, $doctorId, $sessionTypeId) {

      $patient = Patient::query()->findOrFail($patientId);
      $doctor  = Doctor::query()->findOrFail($doctorId);
      $stype   = SessionType::query()->findOrFail($sessionTypeId);

      // 1) Treatment (si no vino, creamos uno activo/indefinido por defecto)
      $treatment = null;
      if (!empty($payload['treatment_id'])) {
        $treatment = Treatment::query()->findOrFail($payload['treatment_id']);
      } else {
        $treatment = Treatment::query()->create([
          'patient_id'       => $patient->id,
          'doctor_id'        => $doctor->id,
          'session_type_id'  => $stype->id,
          'planned_sessions' => null,
          'is_indefinite'    => true,
          'status'           => 'active',
          'start_date'       => now()->toDateString(),
          'end_date'         => null,
          'notes'            => 'Auto generado por atención sin tratamiento previo',
        ]);
      }

      // 2) Si vino desde cita, marcamos estados básicos (opcional)
      $appointment = null;
      if (!empty($payload['appointment_id'])) {
        $appointment = Appointment::query()->findOrFail($payload['appointment_id']);
        $appointment->status = 'completed';
        $appointment->completed_at = now();
        $appointment->save();
      }

      // 3) Crear TreatmentSession
      $patientAmount = isset($payload['patient_amount'])
        ? (float) $payload['patient_amount']
        : (float) $stype->base_price;

      $ts = TreatmentSession::query()->create([
        'treatment_id'     => $treatment->id,
        'appointment_id'   => $appointment?->id,
        'doctor_id'        => $doctor->id,
        'patient_id'       => $patient->id,
        'session_type_id'  => $stype->id,
        'attended_at'      => $payload['attended_at'] ?? now(),
        'status'           => TreatmentSession::STATUS_COMPLETED,
        'session_number'   => ($treatment->sessions()->count() + 1),
        'patient_amount'   => $patientAmount,
        'doctor_amount'    => 0,
        'clinic_amount'    => 0,
        'notes'            => $payload['notes'] ?? null,
        'meta'             => [],
      ]);

      // 4) Comisión
      $this->commission->applyToSession($ts);
      $ts->refresh();

      // 5) Intentar cubrir con Plan
      $coveredByPlan = false;
      $bestPlan = $this->plans->pickBestActivePlanFor($patientId, $sessionTypeId);
      if ($bestPlan && $bestPlan->isUsable() && $bestPlan->coversSessionType($sessionTypeId)) {
        $this->plans->consumeSessions($bestPlan, $ts, qty: 1, notes: 'Consumo automático por atención');
        $coveredByPlan = true;
      }

      // 6) Pago/Deuda/DTE según modo
      $mode   = $payload['payment']['mode']   ?? ($coveredByPlan ? 'planOnly' : 'debt');
      $method = $payload['payment']['method'] ?? null;

      // DTE config
      $issueDte = (bool)($payload['dte']['issue'] ?? false);
      $dteType  = $payload['dte']['type'] ?? 'boleta';

      if ($coveredByPlan) {
        // Si hay plan, normalmente NO emites boleta por la sesión (ya se facturó el plan),
        // a menos que haya copago/diferencia (no lo consideramos aquí).
        // No generamos deuda ni pago.
        return $ts->fresh();
      }

      // Si no hay plan:
      if ($mode === 'now') {
        // pago inmediato
        if (!$method) {
          throw new RuntimeException('Falta método de pago para cobro inmediato.');
        }
        $payment = $this->payments->chargeNowForSession(
          session: $ts,
          method: $method
        );

        // DTE inmediato si corresponde
        if ($issueDte) {
          $inv = $this->invoices->issueForSession($ts, type: $dteType);
          // alocamos pago a DTE (opcional)
          $this->payments->allocateToInvoice($payment, $inv);
          if ($inv->total_amount > 0 && $payment->amount >= $inv->total_amount) {
            $inv->settleAsPaid();
          }
        }

        return $ts->fresh();
      }

      if ($mode === 'debt') {
        // generar deuda
        Debt::query()->create([
          'treatment_session_id' => $ts->id,
          'original_amount'      => $ts->patient_amount ?? 0,
          'paid_amount'          => 0,
          'status'               => 'pending',
          'due_date'             => now()->addDays(10)->toDateString(),
          'payment_reminders_sent' => 0,
        ]);

        // DTE diferido: emites cuando pague (recomendado)
        return $ts->fresh();
      }

      // planOnly pero sin plan → cae a deuda
      Debt::query()->create([
        'treatment_session_id' => $ts->id,
        'original_amount'      => $ts->patient_amount ?? 0,
        'paid_amount'          => 0,
        'status'               => 'pending',
        'due_date'             => now()->addDays(10)->toDateString(),
        'payment_reminders_sent' => 0,
      ]);

      return $ts->fresh();
    });
  }
}
