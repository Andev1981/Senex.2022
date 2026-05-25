<?php

namespace App\Services\Treatments;

use App\Models\Treatment;
use App\Models\Invoice;
use App\Models\Patient;
use App\Jobs\SendPaymentReminderJob;
use App\Models\Doctor;
use App\Models\DoctorCommissionRate;
use App\Models\PatientPlan;
use App\Models\Item;
use App\Models\TreatmentSession;
use App\Services\Payments\PaymentService;
use App\Services\Plans\PlanService;
use App\Services\Treatments\TreatmentService;
use App\Enums\AppointmentStatusEnum;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Notifications\SessionScheduledNotification;

class TreatmentSessionService
{
    public function __construct(
        private PaymentService $paymentService,
        private PlanService $planService,
        private TreatmentService $treatmentService,
        private \App\Services\AgreementService $agreementService,
        private \App\Services\AgendaService $agendaService
    ) {}

    public function createSession(array $data): TreatmentSession
    {
        return DB::transaction(function () use ($data) {
            $doctor = Doctor::findOrFail($data['doctor_id']);

            $bypass = $data['bypass_availability_check'] ?? false;

            if (!$bypass && isset($data['doctor_id']) && isset($data['date']) && isset($data['time'])) {
                $this->validateDoctorAvailability($doctor, $data['date'], $data['time'], $data['room_id'] ?? null, $data['appointment_id'] ?? null);
                if (isset($data['patient_id'])) {
                    $this->validatePatientAvailability($data['patient_id'], $data['date'], $data['time']);
                }
            }

            $itemId = $data['item_id'] ?? $data['session_type_id'] ?? null;
            if (!$itemId) {
                throw new \Exception('Debe seleccionar un tipo de servicio');
            }

            $item = Item::findOrFail($itemId);

            // --- APLICACIÓN DE CONVENIOS (PRICING) ---
            // Si no viene un monto manual, intentamos aplicar la regla de convenio activa
            if (empty($data['patient_amount_clp']) || (int)$data['patient_amount_clp'] === 0) {
                $rule = $this->agreementService->getApplicableRule($data['patient_id'], $itemId);
                if ($rule) {
                    $data['patient_amount_clp'] = $rule->patient_share_clp;
                    $data['insurance_share_clp'] = $rule->insurance_share_clp;
                    $data['patient_amount_gross_clp'] = $rule->gross_price_clp; // Para auditoría
                } else {
                    $data['patient_amount_clp'] = (int)($item->price ?? 0);
                    $data['insurance_share_clp'] = 0;
                }
            }

            // 🔍 Detetar si el paciente es propio (para comisión)
            if (!isset($data['is_own_patient'])) {
                $assignment = \App\Models\DoctorPatientAssignment::active()
                    ->where('patient_id', $data['patient_id'])
                    ->where('doctor_id', $data['doctor_id'])
                    ->first();
                $data['is_own_patient'] = $assignment ? (bool)$assignment->is_own_patient : false;
            }

            // Lógica de Comisión
            // Se usa el servicio CommissionService para mayor precisión si está disponible
            if (class_exists('\App\Services\CommissionService')) {
                $commService = app(\App\Services\CommissionService::class);
                $patientAmount = (float)($data['patient_amount_clp'] ?? $item->price ?? 0);
                
                // Creamos un objeto temporal para el cálculo si no existe aún el registro
                $calc = $commService->computeFor($data['doctor_id'], $itemId, $patientAmount);
                $data['doctor_amount_clp'] = $calc['doctor_amount_clp'];
                $data['clinic_amount_clp'] = $calc['clinic_amount_clp'];
                $data['patient_amount_clp'] = $patientAmount;
            } else {
                // Fallback simplificado
                $doctorAmount = (int)($item->serviceDetail?->default_doctor_commission_clp ?? 0);
                if (empty($data['patient_amount_clp']) || (int)$data['patient_amount_clp'] === 0) {
                    $data['patient_amount_clp'] = (int)($item->price ?? 0);
                }
                $data['doctor_amount_clp'] = $doctorAmount;
                $data['clinic_amount_clp'] = $data['patient_amount_clp'] - $doctorAmount;
            }

            $this->assignPatientToDoctor($data['patient_id'], $data['doctor_id'], session('current_company_id'), session('active_branch_id'));

            if (empty($data['treatment_id'])) {
                $treatment = $this->treatmentService->createTreatmentFromSession($data);
                $data['treatment_id'] = $treatment->id;
            }

            $session = TreatmentSession::create($data);
            $this->resequenceMonthSessions($session->treatment_id, $session->date);
            
            return $session->fresh() ?? $session;
        });
    }

    public function updateSession(TreatmentSession $session, array $data): TreatmentSession
    {
        return DB::transaction(function () use ($session, $data) {
            $session->update($data);
            if ($session->treatment_id) {
                $this->resequenceMonthSessions($session->treatment_id, $session->date);
            }
            return $session->fresh() ?? $session;
        });
    }

    public function completeSession(TreatmentSession $session, array $clinicalData = []): TreatmentSession
    {
        return DB::transaction(function () use ($session, $clinicalData) {
            if ($session->isCompleted()) {
                return $session;
            }

            Log::info("Finalizando sesion {$session->id}", ['status' => $session->status->value]);

            // 1. Mapeo de campos SOAP (Soportar tanto *_notes como nombres directos)
            $session->subjective = $clinicalData['subjective'] ?? $clinicalData['subjective_notes'] ?? $session->subjective;
            $session->objective  = $clinicalData['objective']  ?? $clinicalData['objective_notes']  ?? $session->objective;
            $session->assessment = $clinicalData['assessment'] ?? $clinicalData['assessment_notes'] ?? $session->assessment;
            $session->plan       = $clinicalData['plan']       ?? $clinicalData['plan_notes']       ?? $session->plan;

            // 2. Forzar estado COMPLETED y fecha de firma
            $session->status = AppointmentStatusEnum::COMPLETED;
            $session->signed_at = now();

            // 3. Rellenar el resto de campos permitidos
            $session->fill(collect($clinicalData)->except(['status', 'signed_at', 'subjective', 'objective', 'assessment', 'plan', 'subjective_notes', 'objective_notes', 'assessment_notes', 'plan_notes'])->toArray());
            $session->save();

            // 4. Promover data si es sesión de evaluación (Foto Inicial)
            if ($session->item?->serviceDetail?->is_evaluation && $session->treatment) {
                $session->treatment->update([
                    'initial_pain_level' => $session->pain_before ?? $session->pain_level,
                    'initial_pain_map'   => $session->session_pain_map,
                    'objectives'         => $clinicalData['objectives'] ?? $session->plan, 
                ]);
            }

            if ($session->treatment_id) {
                $this->treatmentService->updateTreatmentCalculatedFields((int) $session->treatment_id);
            }
            
            $this->handleSessionPayment($session);

            return $session->fresh() ?? $session;
        });
    }

    public function cancelSession(TreatmentSession $session, ?string $reason = null): TreatmentSession
    {
        return DB::transaction(function () use ($session, $reason) {
            if ($session->isCompleted()) {
                throw new \Exception('No se puede cancelar una sesión completada');
            }

            $session->update([
                'status' => AppointmentStatusEnum::CANCELLED,
                'cancellation_note' => $reason
            ]);

            if ($session->treatment_id) {
                $this->treatmentService->updateTreatmentCalculatedFields((int) $session->treatment_id);
            }

            // Eliminar factura pendiente si existe
            Invoice::whereHas('items', function($q) use ($session) {
                $q->where('treatment_session_id', $session->id);
            })->where('payment_status', 'unpaid')->delete();

            return $session->fresh() ?? $session;
        });
    }

    public function markAsNoShow(TreatmentSession $session): TreatmentSession
    {
        return DB::transaction(function () use ($session) {
            $session->update(['status' => AppointmentStatusEnum::NO_SHOW]);
            if ($session->treatment_id) {
                $this->treatmentService->updateTreatmentCalculatedFields((int) $session->treatment_id);
            }
            return $session->fresh() ?? $session;
        });
    }

    public function deleteSession(TreatmentSession $session)
    {
        return DB::transaction(function () use ($session) {
            $treatmentId = $session->treatment_id;
            $date = $session->date;
            
            $session->delete();

            if ($treatmentId) {
                $this->resequenceMonthSessions($treatmentId, $date);
            }
        });
    }

    private function handleSessionPayment(TreatmentSession $session): void
    {
        if (!$session->patient_id) {
            Log::warning("Sesión {$session->id} sin patient_id al procesar pago.");
            return;
        }

        if (!$session->relationLoaded('patient') || !$session->patient) {
            $session->load('patient');
        }

        if (!$session->patient) {
            Log::error("No se pudo cargar el paciente para la sesión {$session->id}");
            return;
        }

        // 1. JERARQUÍA 1: PACKS INTERNOS (PREPAGO / SESIONES COMPRADAS)
        $pack = $session->patient->activeInternalPacks()
            ->whereHas('plan.items', function($q) use ($session) {
                $q->where('items.id', $session->item_id);
            })
            ->first();

        if ($pack) {
            $this->planService->consumeSessionsFromPlan($pack, $session);
            
            // 🎯 NUEVO: Generar Boleta Exenta diferida por el consumo de este Pack
            try {
                app(\App\Services\Invoices\InvoiceService::class)->issueForPackConsumption($session, $pack);
                $session->update(['dte_generated' => true]);
            } catch (\Exception $e) {
                Log::error("Fallo emisión DTE por consumo de Pack en Sesión {$session->id}: " . $e->getMessage());
            }

            $session->update(['patient_amount_clp' => 0]);
            return;
        }

        // 2. JERARQUÍA 2: CONVENIOS EXTERNOS (ISAPRE / FONASA)
        $rule = $this->agreementService->getApplicableRule($session->patient_id, $session->item_id);
        
        if ($rule) {
            // El motor de facturación ahora acepta la regla para dividir deudas
            $this->paymentService->createPendingInvoiceForSession($session, $rule);
            return;
        }

        // 3. JERARQUÍA 3: PARTICULAR (TARIFA BASE)
        $this->paymentService->createPendingInvoiceForSession($session);
    }

    public function resequenceMonthSessions(int $treatmentId, $date): void
    {
        $carbonDate = Carbon::parse($date);
        $monthStart = $carbonDate->copy()->startOfMonth();
        $monthEnd = $carbonDate->copy()->endOfMonth();

        $sessions = TreatmentSession::where('treatment_id', $treatmentId)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->whereIn('status', [AppointmentStatusEnum::SCHEDULED, AppointmentStatusEnum::COMPLETED, AppointmentStatusEnum::IN_PROGRESS, AppointmentStatusEnum::CHECKED_IN])
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        DB::transaction(function () use ($sessions) {
            $sequence = 1;
            foreach ($sessions as $session) {
                if ($session->month_session_number !== $sequence) {
                    $session->month_session_number = $sequence;
                    $session->save(['touch' => false]);
                }
                $sequence++;
            }
        });
    }

    public function notifyPatient(TreatmentSession $session): void
    {
        $patient = Patient::findOrFail($session->patient_id);
        $notifiable = ($patient->require_tutor && $patient->primaryContact) ? $patient->primaryContact : $patient;
        $session->load(['doctor', 'branch']);
        $notifiable->notify(new SessionScheduledNotification($session));
    }

    private function validateDoctorAvailability(Doctor $doctor, $date, $time, $roomId = null, ?int $excludeAppointmentId = null): void
    {
        $start = Carbon::parse("$date $time");
        $end = $start->copy()->addMinutes(30); // Duración estándar para validación
        $room = $roomId ? \App\Models\Room::find($roomId) : null;

        $status = $this->agendaService->getSlotOccupancyStatus($doctor, $start, $end, $room, 'onsite', $excludeAppointmentId);

        if (!$status['is_available']) {
            throw new \Exception("Capacidad excedida: {$status['reason']}");
        }
    }

    private function validatePatientAvailability(int $patientId, $date, $time): void
    {
        $exists = TreatmentSession::where('patient_id', $patientId)
            ->where('date', $date)
            ->where('time', $time)
            ->whereNotIn('status', [AppointmentStatusEnum::CANCELLED, AppointmentStatusEnum::NO_SHOW])
            ->exists();

        if ($exists) {
            throw new \Exception('El paciente ya posee una sesión agendada en ese horario');
        }
    }

    private function assignPatientToDoctor($patientId, $doctorId, $companyId, $branchId)
    {
        \App\Models\DoctorPatientAssignment::updateOrCreate(
            ['patient_id' => $patientId, 'doctor_id' => $doctorId, 'ended_at' => null],
            ['company_id' => $companyId, 'branch_id' => $branchId]
        );
    }
}

