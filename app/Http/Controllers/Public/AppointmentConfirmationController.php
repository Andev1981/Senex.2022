<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Enums\AppointmentStatusEnum;
use Illuminate\Http\Request;

class AppointmentConfirmationController extends Controller
{
    public function confirm(Request $request, Appointment $appointment)
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Link de confirmación inválido o expirado.');
        }

        if ($appointment->status !== AppointmentStatusEnum::SCHEDULED) {
            return view('public.appointments.status', [
                'message' => 'Esta cita ya ha sido procesada.',
                'type' => 'info'
            ]);
        }

        $appointment->update(['status' => AppointmentStatusEnum::CONFIRMED]);

        // Si existe una sesión vinculada, también la confirmamos
        if ($appointment->treatmentSession) {
            $appointment->treatmentSession->update(['status' => AppointmentStatusEnum::CONFIRMED]);
        }

        return view('public.appointments.status', [
            'message' => '¡Cita confirmada con éxito! Te esperamos.',
            'type' => 'success'
        ]);
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Link de cancelación inválido o expirado.');
        }

        if ($appointment->status === AppointmentStatusEnum::CANCELLED) {
            return view('public.appointments.status', [
                'message' => 'Esta cita ya se encuentra cancelada.',
                'type' => 'info'
            ]);
        }

        $appointment->update([
            'status' => AppointmentStatusEnum::CANCELLED,
            'notes' => $appointment->notes . "\n[Cancelado por el paciente vía link]"
        ]);

        if ($appointment->treatmentSession) {
            $appointment->treatmentSession->update(['status' => AppointmentStatusEnum::CANCELLED]);
        }

        return view('public.appointments.status', [
            'message' => 'Cita cancelada correctamente.',
            'type' => 'warning'
        ]);
    }
}
