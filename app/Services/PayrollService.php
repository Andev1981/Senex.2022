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
        ->whereBetween('date', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
        ->where('status', TreatmentSession::STATUS_COMPLETED)
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
                'session_type_id'      => $s->session_type_id,
                'service_date'         => $s->date, // Asumiendo que 'date' es la fecha de la sesión
                'attended'             => ($s->status === 'completed' || $s->status === 'attended') ? 1 : 0,

                // 4. Montos Financieros
                // Lo que pagó el paciente
                'patient_amount_clp'     => $s->patient_amount_clp ?? 0, 
                
                // Base sobre la que se calcula la comisión (usualmente lo mismo que pagó el paciente)
                'commission_base_clp'    => $s->patient_amount_clp ?? 0, 
                
                // Lo que gana el doctor (Tu campo 'doctor_amount_clp' va aquí)
                'commission_amount_clp'  => $s->doctor_amount_clp ?? 0, 
                
                // Ajustes (Bonos/Descuentos extra, iniciamos en 0)
                'adjustment_amount_clp' => 0, 
                
                // Total a pagar en esta línea (Comisión + Ajustes)
                'subtotal_clp'           => $s->doctor_amount_clp ?? 0, 

                // 5. Datos de la Tasa/Tarifa aplicada
                // Como ya traes el monto calculado, asumimos que fue un monto fijo o calculamos el % inverso
                'rate_type'            => 'fixed_amount', // O 'percentage' según tu lógica
                'rate_amount_clp'      => $s->doctor_amount_clp ?? 0,
                'rate_percentage'      => 0, // Podrías calcularlo: ($s->doctor_amount / $s->patient_amount) * 100

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
    return $p->fresh();
  }

  public function markPaid(Payroll $p): Payroll
  {
    $p->markPaid();
    return $p->fresh();
  }
}
