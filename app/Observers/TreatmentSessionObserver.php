<?php

namespace App\Observers;

use App\Models\TreatmentSession;
use App\Enums\AppointmentStatusEnum;

class TreatmentSessionObserver
{
    /**
     * Handle the TreatmentSession "updated" event.
     */
    public function updated(TreatmentSession $session): void
    {
        // Detectar si el estado cambió a COMPLETED
        if ($session->isDirty('status') && $session->status === AppointmentStatusEnum::COMPLETED) {
            $this->incrementTreatmentSessions($session);
        }

        // Detectar si el estado dejó de ser COMPLETED (por ejemplo, cancelada por error)
        if ($session->isDirty('status') && $session->getOriginal('status') === AppointmentStatusEnum::COMPLETED) {
            $this->decrementTreatmentSessions($session);
        }
    }

    /**
     * Handle the TreatmentSession "created" event.
     */
    public function created(TreatmentSession $session): void
    {
        // Si se crea ya marcada como completada (ej. carga masiva o migración manual)
        if ($session->status === AppointmentStatusEnum::COMPLETED) {
            $this->incrementTreatmentSessions($session);
        }
    }

    /**
     * Handle the TreatmentSession "deleted" event.
     */
    public function deleted(TreatmentSession $session): void
    {
        // Si se borra una sesión que ya estaba completada, debemos descontarla
        if ($session->status === AppointmentStatusEnum::COMPLETED) {
            $this->decrementTreatmentSessions($session);
        }
    }

    private function incrementTreatmentSessions(TreatmentSession $session): void
    {
        $treatment = $session->treatment;
        if ($treatment) {
            $treatment->incrementCompletedSessions();
        }
    }

    private function decrementTreatmentSessions(TreatmentSession $session): void
    {
        $treatment = $session->treatment;
        if ($treatment && $treatment->completed_sessions > 0) {
            $treatment->decrement('completed_sessions');
            
            // Si el tratamiento estaba cerrado y ahora le falta una sesión, lo re-abrimos
            if ($treatment->status === \App\Enums\TreatmentStatusEnum::COMPLETED) {
                $treatment->update(['status' => \App\Enums\TreatmentStatusEnum::IN_PROGRESS]);
            }
        }
    }
}
