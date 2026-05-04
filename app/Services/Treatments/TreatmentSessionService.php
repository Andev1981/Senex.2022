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
        private \App\Services\AgreementService $agreementService
    ) {}

    public function createSession(array $data): TreatmentSession
    {
        return DB::transaction(function () use ($data) {
            $doctor = Doctor::findOrFail($data['doctor_id']);

            if (isset($data['doctor_id']) && isset($data['date']) && isset($data['time'])) {
                $this->validateDoctorAvailability($data['doctor_id'], $data['date'], $data['time']);
                if (isset($data['patient_id'])) {
                    $this->validatePatientAvailability($data['patient_id'], $data['date'], $data['time']);
                }
            }

            $itemId = $data['item_id'] ?? $data['session_type_id'] ?? null;
            if (!$itemId) {
                throw new \Exception('Debe seleccionar un tipo de servicio');
            }

            $item = Item::findOrFail($itemId);

            // Lógica de Comisión (Simplificada para brevedad, asumiendo que ya funciona)
            $doctorAmount = (int)($item->serviceDetail?->default_doctor_commission_clp ?? 0);
            
            if (empty($data['patient_amount_clp']) || (int)$data['patient_amount_clp'] === 0) {
                $data['patient_amount_clp'] = (int)($item->price ?? 0);
            }

            $data['doctor_amount_clp'] = $doctorAmount;
            $data['clinic_amount_clp'] = $data['patient_amount_clp'] - $doctorAmount;

            $this->assignPatientToDoctor($data['patient_id'], $data['doctor_id'], session('current_company_id'), session('active_branch_id'));

            if (empty($data['treatment_id'])) {
                $treatment = $this->treatmentService->createTreatmentFromSession($data);
                $data['treatment_id'] = $treatment->id;
            }

            $session = TreatmentSession::create($data);
            $this->resequenceMonthSessions($session->treatment_id, $session->date);
            
            return $session->fresh();
        });
    }

    public function updateSession(TreatmentSession $session, array $data): TreatmentSession
    {
        return DB::transaction(function () use ($session, $data) {
            $session->update($data);
            if ($session->treatment_id) {
                $this->resequenceMonthSessions($session->treatment_id, $session->date);
            }
            return $session->fresh();
        });
    }

    public function completeSession(TreatmentSession $session, array $clinicalData): TreatmentSession
    {
        return DB::transaction(function () use ($session, $clinicalData) {
            if ($session->isCompleted()) {
                throw new \Exception('La sesión ya está completada');
            }

            $clinicalData['status'] = AppointmentStatusEnum::COMPLETED;
            $clinicalData['signed_at'] = now();

            $session->update($clinicalData);

            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);
            $this->handleSessionPayment($session);

            return $session->fresh();
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

            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);

            // Eliminar factura pendiente si existe
            Invoice::whereHas('items', function($q) use ($session) {
                $q->where('treatment_session_id', $session->id);
            })->where('payment_status', 'unpaid')->delete();

            return $session->fresh();
        });
    }

    public function markAsNoShow(TreatmentSession $session): TreatmentSession
    {
        return DB::transaction(function () use ($session) {
            $session->update(['status' => AppointmentStatusEnum::NO_SHOW]);
            $this->treatmentService->updateTreatmentCalculatedFields($session->treatment_id);
            return $session->fresh();
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
        $session->load('patient');

        // 1. JERARQUÍA 1: PACKS INTERNOS (PREPAGO / SESIONES COMPRADAS)
        $pack = $session->patient->activeInternalPacks()
            ->whereHas('plan.items', function($q) use ($session) {
                $q->where('items.id', $session->item_id);
            })
            ->first();

        if ($pack) {
            $this->planService->consumeSessionsFromPlan($pack, $session);
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

    private function validateDoctorAvailability(int $doctorId, $date, $time): void
    {
        $count = TreatmentSession::where('doctor_id', $doctorId)
            ->where('date', $date)
            ->where('time', $time)
            ->whereNotIn('status', [AppointmentStatusEnum::CANCELLED, AppointmentStatusEnum::NO_SHOW])
            ->count();

        if ($count >= 3) {
            throw new \Exception('El especialista ya posee el máximo de sesiones simultáneas permitidas (3)');
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
        DB::table('doctor_patient_assignments')->updateOrInsert(
            ['patient_id' => $patientId, 'doctor_id' => $doctorId],
            ['company_id' => $companyId, 'branch_id' => $branchId, 'updated_at' => now(), 'created_at' => now()]
        );
    }
}
