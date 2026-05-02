<?php

namespace App\Http\Controllers\Admin\Calendars;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Item;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\AgendaService;

class AppointmentController extends Controller
{
    protected $agendaService;

    public function __construct(AgendaService $agendaService)
    {
        $this->agendaService = $agendaService;
    }

    public function index()
    {
        $companyId = session('current_company_id');

        $appointments = Appointment::where('company_id', $companyId)
            ->with(['patient', 'doctor', 'item', 'room'])
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'date' => $apt->start_at->format('Y-m-d'),
                    'start_time' => $apt->start_at->format('H:i'),
                    'end_time' => $apt->end_at->format('H:i'),
                    'patient' => $apt->patient,
                    'doctor' => $apt->doctor,
                    'item' => $apt->item,
                    'room' => $apt->room,
                    'modality' => $apt->modality?->value ?? 'onsite',
                    'status' => $apt->status,
                    'notes' => $apt->notes,
                ];
            });

        return Inertia::render('agendas/AgendaCalendar', [
            'appointments' => $appointments,
            'doctors' => Doctor::where('company_id', $companyId)->where('is_active', true)->get(),
            'patients' => Patient::where('company_id', $companyId)->get(),
            'items' => Item::where('company_id', $companyId)->get(),
            'rooms' => Room::where('branch_id', session('active_branch_id'))->get(),
            'availabilities' => \App\Models\Availability::where('company_id', $companyId)->get(),
            'holidays' => \App\Models\Holiday::where('company_id', $companyId)->get(),
        ]);
    }

    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
        ]);

        $doctor = Doctor::findOrFail($request->doctor_id);
        $date = Carbon::parse($request->date);

        $slots = $this->agendaService->getAvailableSlots($doctor, $date);

        return response()->json([
            'slots' => $slots
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'item_id' => 'required|exists:items,id',
            'room_id' => 'nullable|exists:rooms,id',
            'modality' => 'required|in:onsite,home',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'notes' => 'nullable|string',
            'send_mail' => 'boolean',
            'send_whatsapp' => 'boolean',
            'is_direct' => 'boolean', // 👈 Nueva bandera para Atención Directa
        ]);

        $start_at = Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $end_at = Carbon::parse($validated['date'] . ' ' . $validated['end_time']);

        // 1. Bloquear Citas en el Pasado (Excepto si es directa, que puede ser 'ahora mismo')
        if (!$request->boolean('is_direct') && $start_at->isPast()) {
            return back()->withErrors(['start_time' => 'No se pueden agendar citas en el pasado.']);
        }

        // 2. Validar que el Profesional esté de turno (Shift Check)
        $doctor = Doctor::findOrFail($validated['doctor_id']);
        if (!$this->agendaService->isDoctorOnDuty($doctor, $start_at, $end_at)) {
            return back()->withErrors(['doctor_id' => 'El profesional no tiene turno asignado en este horario o está en colación.']);
        }

        $status = $request->boolean('is_direct') ? \App\Enums\AppointmentStatusEnum::IN_PROGRESS : \App\Enums\AppointmentStatusEnum::SCHEDULED;

        $appointment = Appointment::create([
            'company_id' => session('current_company_id'),
            'branch_id' => session('active_branch_id'),
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'],
            'item_id' => $validated['item_id'],
            'room_id' => $validated['room_id'] ?: null,
            'modality' => $validated['modality'],
            'start_at' => $start_at,
            'end_at' => $end_at,
            'status' => $status,
            'notes' => $validated['notes'],
            'check_in_at' => $request->boolean('is_direct') ? now() : null,
            'started_at' => $request->boolean('is_direct') ? now() : null,
        ]);

        // 3. Si es Atención Directa, crear la Sesión de inmediato
        if ($request->boolean('is_direct')) {
            \App\Models\TreatmentSession::create([
                'company_id' => $appointment->company_id,
                'branch_id' => $appointment->branch_id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'item_id' => $appointment->item_id,
                'appointment_id' => $appointment->id,
                'room_id' => $appointment->room_id,
                'date' => $appointment->start_at->toDateString(),
                'time' => $appointment->start_at->toTimeString(),
                'status' => \App\Enums\AppointmentStatusEnum::IN_PROGRESS,
                'checked_in_at' => now(),
                'started_at' => now(),
            ]);
        }

        // Disparar notificaciones si aplica (Solo si NO es directa, ya que el paciente ya está ahí)
        if (!$request->boolean('is_direct')) {
            $channels = [];
            if ($request->boolean('send_mail')) $channels[] = 'mail';
            if ($request->boolean('send_whatsapp')) $channels[] = 'whatsapp';

            if (!empty($channels)) {
                 $appointment->patient->notify(new \App\Notifications\AppointmentConfirmationNotification($appointment, $channels));
            }
        }

        $msg = $request->boolean('is_direct') ? 'Atención iniciada correctamente.' : 'Cita agendada correctamente.';
        return back()->with('success', $msg);
    }

    public function checkin(Appointment $appointment)
    {
        if ($appointment->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        // 1. Actualizar Cita
        $appointment->update([
            'status' => \App\Enums\AppointmentStatusEnum::CHECKED_IN,
            'check_in_at' => now()
        ]);

        // 2. Crear o Buscar Sesión de Tratamiento vinculada
        // Si la cita ya tiene un tratamiento previo o es parte de uno, lo vinculamos
        $session = \App\Models\TreatmentSession::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'company_id' => $appointment->company_id,
                'branch_id' => $appointment->branch_id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'item_id' => $appointment->item_id,
                'room_id' => $appointment->room_id,
                'date' => $appointment->start_at->toDateString(),
                'time' => $appointment->start_at->toTimeString(),
                'status' => \App\Enums\AppointmentStatusEnum::CHECKED_IN,
                'checked_in_at' => now(),
            ]
        );

        // 3. Generar Deuda / Ítem de Cobro (Lógica simplificada por ahora)
        // Aquí se dispararía el InvoiceService en el futuro

        return back()->with('success', 'Paciente recepcionado. Ya puede pasar a sala de espera.');
    }

    public function cancel(Appointment $appointment)
    {
        if ($appointment->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        DB::transaction(function () use ($appointment) {
            $appointment->update(['status' => \App\Enums\AppointmentStatusEnum::CANCELLED]);

            // Si ya se había creado una sesión (ej: después del check-in), cancelarla también
            if ($appointment->treatmentSession) {
                $appointment->treatmentSession->update(['status' => \App\Enums\AppointmentStatusEnum::CANCELLED]);
            }
        });

        return back()->with('success', 'Cita anulada.');
    }
}
