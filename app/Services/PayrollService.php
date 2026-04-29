<?php

namespace App\Services;

use App\Enums\AppointmentStatusEnum;
use App\Models\{Payroll, PayrollDetail, TreatmentSession, Doctor};
use App\Notifications\PayrollApprovedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayrollService
{
  /**
   * Simula la liquidación para previsualización
   */
  public function calculateForPeriod(int $doctorId, string $fromDate, string $toDate): array
  {
      $sessions = TreatmentSession::query()
        ->where('doctor_id', $doctorId)
        ->whereBetween('date', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
        ->where('status', AppointmentStatusEnum::COMPLETED->value)
        ->get();

      $totalSessions = $sessions->count();
      $totalPatientAmount = 0;
      $totalDoctorAmount = 0; // Lo que realmente gana el doctor
      $totalClinicAmount = 0; // La retención

      foreach ($sessions as $s) {
          $pAmount = $s->patient_amount_clp ?? 0;
          $dAmount = $s->doctor_amount_clp ?? 0;
          
          // La retención es la diferencia
          $cAmount = $pAmount - $dAmount;

          $totalPatientAmount += $pAmount;
          $totalDoctorAmount += $dAmount;
          $totalClinicAmount += $cAmount;
      }

      return [
          'doctor_id' => $doctorId,
          'period_start' => $fromDate,
          'period_end' => $toDate,
          'total_sessions' => $totalSessions,
          'total_patient_amount_clp' => $totalPatientAmount,
          'total_commission_amount_clp' => $totalClinicAmount, // Retención Clínica
          'total_payable_clp' => $totalDoctorAmount, // Lo que se le paga al doctor
      ];
  }

  public function buildForPeriod(int $doctorId, string $fromDate, string $toDate): Payroll
  {
    return DB::transaction(function () use ($doctorId, $fromDate, $toDate) {
      
      $sessions = TreatmentSession::query()
        ->where('doctor_id', $doctorId)
        ->whereBetween('date', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
        ->where('status', AppointmentStatusEnum::COMPLETED->value)
        ->get();
        

      $payroll = Payroll::query()->create([
        'doctor_id' => $doctorId,
        'period_start' => $fromDate,
        'period_end'   => $toDate,
        'status'       => Payroll::STATUS_DRAFT,
        'total_sessions' => 0,
        'total_patient_amount_clp' => 0,
        'total_commission_amount_clp'  => 0,
        'total_adjustments_clp'  => 0,
        'total_payable_clp' => 0,
        'paid_at' => Carbon::now(),
      ]);
      
      
      try{
        foreach ($sessions as $s) {
          
          $patientAmount = $s->patient_amount_clp ?? 0;
          $doctorAmount  = $s->doctor_amount_clp ?? 0;
          $clinicRetention = $patientAmount - $doctorAmount;

          PayrollDetail::query()->create([
                // 1. Identificadores Básicos
                'payroll_id'           => $payroll->id,
                
                // 2. Relación Polimórfica (Origen del cobro)
                'source_type'          => $s->getMorphClass(), // Guarda "TreatmentSession"
                'source_id'            => $s->id,
                'treatment_session_id' => $s->id,

                // 3. Datos Clínicos
                'patient_id'           => $s->patient_id,
                'doctor_id'            => $s->doctor_id,
                'item_id'      => $s->item_id,
                'service_date'         => $s->date, // Asumiendo que 'date' es la fecha de la sesión
                'attended'             => ($s->status === 'completed' || $s->status === 'attended') ? 1 : 0,

                // 4. Montos Financieros
                // Lo que pagó el paciente
                'patient_amount_clp'     => $patientAmount, 
                
                // Base sobre la que se calcula la comisión
                'commission_base_clp'    => $patientAmount, 
                
                // Retención Clínica (CORREGIDO: Antes era doctor_amount)
                'commission_amount_clp'  => $clinicRetention, 
                
                // Ajustes (Bonos/Descuentos extra, iniciamos en 0)
                'adjustment_amount_clp' => 0, 
                
                // Total a pagar en esta línea (Lo que recibe el doctor)
                'subtotal_clp'           => $doctorAmount, 

                // 5. Datos de la Tasa/Tarifa aplicada
                'rate_type'            => 'fixed_amount', 
                'rate_amount_clp'      => $doctorAmount,
                'rate_percentage'      => ($patientAmount > 0) ? round(($doctorAmount / $patientAmount) * 100, 2) : 0,

                // 6. Auditoría
                'calc_context'         => json_encode(['origin' => 'auto_generated_from_session']),
                'notes'                => null,
            ]);
          
        }
      } catch (\Exception $e) {
        // ESTO TE MOSTRARÁ EL ERROR EXACTO EN PANTALLA
        dd([
            'Error Message' => $e->getMessage(),
            'Linea' => $e->getLine(),
            'Archivo' => $e->getFile(),
            'Datos que intentabas guardar' => $s->toArray()
        ]);
    }


    
    $payroll->recalcTotals();
  
      return $payroll;
    });
  }

  public function approve(Payroll $p): Payroll
  {
    $p->markApproved();
    
    // Notificar al doctor
    if ($p->doctor && $p->doctor->email) {
        try {
            $p->doctor->notify(new PayrollApprovedNotification($p));
        } catch (\Exception $e) {
            // Log error but continue
            \Log::error("Error enviando notificación de liquidación {$p->id}: " . $e->getMessage());
        }
    }

    return $p->fresh();
  }

  public function markPaid(Payroll $p): Payroll
  {
    $p->markPaid();
    return $p->fresh();
  }
}
