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
      $totalGrossAmount = 0; // Lo que paga el paciente/aseguradora
      $totalPayableToDoctor = 0; // Lo que gana el doctor
      $totalClinicCommission = 0; // Lo que retiene la clínica

      foreach ($sessions as $s) {
          $pAmount = (float)($s->patient_amount_clp ?? 0);
          $dAmount = (float)($s->doctor_amount_clp ?? 0);
          
          // La comisión de la clínica es la diferencia
          $cAmount = $pAmount - $dAmount;

          $totalGrossAmount += $pAmount;
          $totalPayableToDoctor += $dAmount;
          $totalClinicCommission += $cAmount;
      }

      return [
          'doctor_id' => $doctorId,
          'period_start' => $fromDate,
          'period_end' => $toDate,
          'total_sessions' => $totalSessions,
          'total_patient_amount_clp' => $totalGrossAmount,
          'total_commission_amount_clp' => $totalClinicCommission, // Retención Clínica
          'total_payable_clp' => $totalPayableToDoctor, // Pago al Profesional
      ];
  }

  public function buildForPeriod(int $doctorId, string $fromDate, string $toDate): Payroll
  {
    return DB::transaction(function () use ($doctorId, $fromDate, $toDate) {
      
      $sessions = TreatmentSession::query()
        ->with(['diagnostic', 'item.category', 'item.serviceDetail'])
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

          // Cálculo del PESO (Fase 3)
          $maxSimultaneous = $s->item?->serviceDetail?->max_simultaneous_patients ?? 1;
          $weight = ($maxSimultaneous == 1) ? 3 : 1;

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
                'item_id'              => $s->item_id,
                'service_date'         => $s->date, 
                'attended'             => ($s->status === AppointmentStatusEnum::COMPLETED) ? 1 : 0,

                // 3.1 Transparencia Clínica (Fase 3)
                'diagnostic_code'      => $s->diagnostic?->code,
                'diagnostic_name'      => $s->diagnostic?->name,
                'service_category'     => $s->item?->category?->name,
                'weight'               => $weight,

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
                'calc_context'         => json_encode([
                  'origin' => 'auto_generated_from_session',
                  'weight_applied' => $weight,
                  'max_simultaneous' => $maxSimultaneous
                ]),
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
