<?php

namespace App\Http\Controllers\Admin\Calendars;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Item;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\AgendaService;
use App\Services\Treatments\TreatmentSessionService;

class AppointmentController extends Controller
{
    protected $agendaService;
    protected $sessionService;

    public function __construct(AgendaService $agendaService, TreatmentSessionService $sessionService)
    {
        $this->agendaService = $agendaService;
        $this->sessionService = $sessionService;
    }

    public function index()
    {
        $companyId = session('current_company_id');

        $appointments = Appointment::where('company_id', $companyId)
            ->where('status', '!=', \App\Enums\AppointmentStatusEnum::CANCELLED)
            ->with(['patient', 'doctor', 'item.serviceDetail', 'room'])
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'date' => $apt->start_at->format('Y-m-d'),
                    'start_time' => $apt->start_at->format('H:i'),
                    'end_time' => $apt->end_at->format('H:i'),
                    'patient_id' => $apt->patient_id,
                    'doctor_id' => $apt->doctor_id,
                    'room_id' => $apt->room_id,
                    'patient' => $apt->patient,
                    'doctor' => $apt->doctor,
                    'item' => $apt->item,
                    'room' => $apt->room,
                    'modality' => $apt->modality?->value ?? 'onsite',
                    'status' => $apt->status,
                    'notes' => $apt->notes,
                ];
            });

        // También traemos sesiones manuales (sin cita) para bloquear disponibilidad real
        $manualSessions = \App\Models\TreatmentSession::where('company_id', $companyId)
            ->whereNull('appointment_id')
            ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
            ->with(['patient', 'doctor', 'item.serviceDetail', 'room'])
            ->get()
            ->map(function ($sess) {
                return [
                    'id' => "sess_{$sess->id}",
                    'date' => $sess->date->format('Y-m-d'),
                    'start_time' => $sess->time->format('H:i'),
                    'end_time' => $sess->time->copy()->addMinutes(45)->format('H:i'), // Estimación 45m
                    'patient_id' => $sess->patient_id,
                    'doctor_id' => $sess->doctor_id,
                    'room_id' => $sess->room_id,
                    'patient' => $sess->patient,
                    'doctor' => $sess->doctor,
                    'item' => $sess->item,
                    'room' => $sess->room,
                    'status' => $sess->status,
                    'is_manual_session' => true
                ];
            });

        return Inertia::render('agendas/AgendaCalendar', [
            'appointments' => $appointments->concat($manualSessions),
            'currentBranch' => \App\Models\Branch::find(session('active_branch_id')),
            'doctors' => Doctor::where('company_id', $companyId)->where('is_active', true)->get(),
            'patients' => Patient::where('company_id', $companyId)->with(['insurance', 'activeTreatments'])->get(),
            'items' => Item::where('company_id', $companyId)->with('serviceDetail')->get(),
            'agreements' => \App\Models\Agreement::where('company_id', $companyId)
                ->where('is_active', true)
                ->with(['rules' => function($q) {
                    $q->select('id', 'agreement_id', 'item_id', 'plan_id', 'patient_share_clp', 'insurance_share_clp', 'patient_percentage');
                }])
                ->get(['id', 'name', 'insurance_id']),
            'rooms' => Room::where('branch_id', session('active_branch_id'))->get(),
            'availabilities' => \App\Models\Availability::where('company_id', $companyId)->get(),
            'holidays' => \App\Models\Holiday::where('company_id', $companyId)->get(),
            'exceptions' => \App\Models\AvailabilityException::where('company_id', $companyId)->with('doctor')->get(),
            'regions' => \Illuminate\Support\Facades\Cache::remember('geo_regions', 86400, fn() => \App\Models\Region::all(['id', 'name'])),
            'communes' => \Illuminate\Support\Facades\Cache::remember('geo_communes', 86400, fn() => \App\Models\Commune::all(['id', 'name', 'region_id'])),
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
            'patient_id' => [
                'required',
                'exists:patients,id',
                function ($attribute, $value, $fail) {
                    $patient = Patient::find($value);
                    if ($patient && (empty($patient->rut) || empty($patient->email) || empty($patient->phone))) {
                        $fail('El perfil del paciente está incompleto (RUT, Email o Teléfono faltante). Por favor actualícelo antes de agendar.');
                    }
                }
            ],
            'doctor_id' => 'required|exists:doctors,id',
            'item_id' => 'required|exists:items,id',
            'room_id' => 'nullable|exists:rooms,id',
            'modality' => 'required|in:onsite,home,online',
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

        // 1.5. Validar Modalidad contra Sucursal e Ítem
        $branch = \App\Models\Branch::find(session('active_branch_id'));
        $item = Item::with('serviceDetail')->findOrFail($validated['item_id']);
        
        $modality = $validated['modality'];
        if ($branch && !$branch->{"allows_{$modality}"}) {
            return back()->withErrors(['modality' => 'Esta modalidad no está permitida en la sucursal actual.']);
        }
        
        if ($item->serviceDetail && !$item->serviceDetail->{"allows_{$modality}"}) {
            return back()->withErrors(['modality' => 'El servicio seleccionado no permite esta modalidad de atención.']);
        }

        // 1.8 Validar Disponibilidad del Paciente (NUEVA REGLA)
        $patientStatus = $this->agendaService->isPatientAvailable($validated['patient_id'], $start_at, $end_at);
        if (!$patientStatus['is_available']) {
            return back()->withErrors(['patient_id' => $patientStatus['reason']]);
        }

        // 2. Validar Capacidad (3 sesiones simultáneas y capacidad de Box)
        $doctor = Doctor::findOrFail($validated['doctor_id']);
        $room = $validated['room_id'] ? Room::find($validated['room_id']) : null;
        
        $capacityStatus = $this->agendaService->getSlotOccupancyStatus(
            $doctor, 
            $start_at, 
            $end_at, 
            $room, 
            $validated['modality']
        );

        if (!$capacityStatus['is_available']) {
            return back()->withErrors(['doctor_id' => "Capacidad excedida: {$capacityStatus['reason']}"]);
        }

        // 3. Validar que el Profesional esté de turno (Shift Check)
        if (!$this->agendaService->isDoctorOnDuty($doctor, $start_at, $end_at, session('active_branch_id'))) {
            return back()->withErrors(['start_time' => 'El profesional no tiene disponibilidad configurada en este horario o el centro está cerrado.']);
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

        // 🎯 ASIGNACIÓN AUTOMÁTICA: Vincular paciente al doctor para visibilidad de ficha clínica
        // Obtenemos si el paciente es propio según la asignación previa o actual
        $assignment = \App\Models\DoctorPatientAssignment::active()
            ->where('patient_id', $appointment->patient_id)
            ->where('doctor_id', $appointment->doctor_id)
            ->first();

        if (!$assignment) {
            $assignment = \App\Models\DoctorPatientAssignment::create([
                'company_id' => $appointment->company_id,
                'branch_id'  => $appointment->branch_id,
                'patient_id' => $appointment->patient_id,
                'doctor_id'  => $appointment->doctor_id,
                'role'       => 'therapist',
                'is_own_patient' => false, // Por defecto asignado si no existe previa asignación como propio
                'started_at' => now(),
            ]);
        }

        // 3. Si es Atención Directa, crear la Sesión de inmediato
        if ($request->boolean('is_direct')) {
            $this->sessionService->createSession([
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
                'is_own_patient' => (bool)$assignment->is_own_patient,
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

    public function checkin(Request $request, Appointment $appointment)
    {
        if ($appointment->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        $doctorId = $request->input('doctor_id', $appointment->doctor_id);
        $roomId = $request->input('room_id', $appointment->room_id);

        // 🛑 VALIDACIÓN DE DISPONIBILIDAD Y CAPACIDAD (Si cambió el doctor o room)
        $doctor = Doctor::findOrFail($doctorId);
        $room = $roomId ? Room::find($roomId) : null;

        if ($doctorId != $appointment->doctor_id) {
            if (!$this->agendaService->isDoctorOnDuty($doctor, $appointment->start_at, $appointment->end_at, $appointment->branch_id)) {
                return back()->withErrors(['doctor_id' => 'El profesional seleccionado no tiene disponibilidad configurada en este horario.']);
            }
        }

        $capacityStatus = $this->agendaService->getSlotOccupancyStatus(
            $doctor, 
            $appointment->start_at, 
            $appointment->end_at, 
            $room, 
            $appointment->modality->value ?? 'onsite',
            $appointment->id
        );

        if (!$capacityStatus['is_available']) {
            return back()->withErrors(['doctor_id' => "Capacidad excedida: {$capacityStatus['reason']}"]);
        }

        // 1. Actualizar Cita
        $appointment->update([
            'status' => \App\Enums\AppointmentStatusEnum::CHECKED_IN,
            'doctor_id' => $doctorId,
            'room_id' => $roomId,
            'check_in_at' => now()
        ]);

        // 2. Asegurar Asignación para el doctor final (por si cambió)
        \App\Models\DoctorPatientAssignment::updateOrCreate(
            ['patient_id' => $appointment->patient_id, 'doctor_id' => $doctorId, 'ended_at' => null],
            ['company_id' => $appointment->company_id, 'branch_id' => $appointment->branch_id]
        );

        // 3. Crear o Buscar Sesión de Tratamiento vinculada
        $sessionData = [
            'company_id' => $appointment->company_id,
            'branch_id' => $appointment->branch_id,
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $doctorId,
            'item_id' => $appointment->item_id,
            'room_id' => $roomId,
            'appointment_id' => $appointment->id,
            'date' => $appointment->start_at->toDateString(),
            'time' => $appointment->start_at->toTimeString(),
            'status' => \App\Enums\AppointmentStatusEnum::CHECKED_IN,
            'checked_in_at' => now(),
        ];

        // Buscamos si ya existe la sesión
        $session = \App\Models\TreatmentSession::where('appointment_id', $appointment->id)->first();

        if ($session) {
            $this->sessionService->updateSession($session, $sessionData);
        } else {
            $this->sessionService->createSession($sessionData);
        }

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

    /**
     * Marca cita como ausente (No-Show)
     */
    public function absent(Appointment $appointment)
    {
        if ($appointment->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        DB::transaction(function () use ($appointment) {
            $appointment->update(['status' => \App\Enums\AppointmentStatusEnum::NO_SHOW]);

            if ($appointment->treatmentSession) {
                $appointment->treatmentSession->update(['status' => \App\Enums\AppointmentStatusEnum::NO_SHOW]);
            }
        });

        return back()->with('success', 'Cita marcada como ausente.');
    }

    /**
     * Elimina/Anula una cita (Alias de cancel para el recurso)
     */
    public function destroy(Appointment $appointment)
    {
        return $this->cancel($appointment);
    }
}
