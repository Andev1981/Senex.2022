<?php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Item;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

use App\Services\Treatments\TreatmentSessionService;

class SessionMobileController extends Controller
{
    public function __construct(
        private TreatmentSessionService $sessionService
    ) {}

    /**
     * Muestra el formulario para crear o editar una sesión (Mobile)
     */
    public function showForm(Request $request, $id = null)
    {
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        
        $canCreate = $isClinicalAdmin || ($doctorBranch['can_create_sessions'] ?? true);
        $canView   = $isClinicalAdmin || ($doctorBranch['can_view_sessions'] ?? true);

        if (!$canView && !$canCreate) {
            abort(403, 'No tienes permiso para acceder a esta sección clínica.');
        }

        $session = null;
        $appointment = null;

        // 1. Si hay un ID, determinar si es una Sesión existente o un Appointment para iniciar
        if ($id) {
            $sessionQuery = TreatmentSession::with(['patient', 'treatment', 'item']);
            $appointmentQuery = \App\Models\Appointment::with(['patient', 'item']);

            // Si no tiene permiso de ver todo, filtrar por su propio doctor_id
            if (!$canView) {
                $sessionQuery->where('doctor_id', $doctor->id);
                $appointmentQuery->where('doctor_id', $doctor->id);
            } else {
                // Si puede ver todo, al menos restringir a la sucursal activa
                $activeBranchId = session('active_branch_id');
                if ($activeBranchId) {
                    $sessionQuery->where('branch_id', $activeBranchId);
                    $appointmentQuery->where('branch_id', $activeBranchId);
                }
            }

            $session = $sessionQuery->find($id);
            
            if (!$session) {
                $appointment = $appointmentQuery->find($id);
            }
        }

        // Obtener pacientes: Si puede ver todo, todos los de la empresa/sucursal, si no solo los suyos
        if ($canView) {
            $patients = Patient::where('company_id', $user->company_id)
                ->select('patients.id', 'patients.name', 'patients.last_name', 'patients.rut')
                ->get();
        } else {
            $patients = $doctor->patients()
                ->select('patients.id', 'patients.name', 'patients.last_name', 'patients.rut')
                ->get();
        }

        // Obtener tratamientos activos del paciente si hay uno seleccionado
        $treatments = [];
        $selectedPatientId = $session?->patient_id ?? $appointment?->patient_id;
        
        if ($selectedPatientId) {
            $treatments = Treatment::with('item')
                ->where('patient_id', $selectedPatientId)
                ->where(function($q) use ($session) {
                    $q->where('status', \App\Enums\TreatmentStatusEnum::IN_PROGRESS);
                    if ($session) {
                        $q->orWhere('id', $session->treatment_id);
                    }
                })
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'patient_id' => $t->patient_id,
                    'diagnosis' => $t->diagnosis,
                    'item_id' => $t->item_id,
                    'session_type_name' => $t->item?->name ?? 'Tipo desconocido',
                ]);
        }

        // Catálogo de servicios
        $items = Item::services()->with('serviceDetail')->get()->map(fn($item) => [
            'id' => $item->id,
            'name' => $item->name,
            'price' => (int)$item->price,
            'duration' => $item->serviceDetail?->duration_minutes ?? 45
        ]);

        // Sesión anterior para referencia clínica
        $previousSession = null;
        if ($selectedPatientId) {
            $prev = TreatmentSession::where('patient_id', $selectedPatientId)
                ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
                ->when($session, fn($q) => $q->where('id', '<', $session->id))
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->first();

            if ($prev) {
                $previousSession = [
                    'date' => $prev->date->toDateString(),
                    'notes' => $prev->notes,
                    'pain_after' => $prev->pain_after,
                    'techniques' => $prev->techniques ?? [],
                    'exercises' => $prev->exercises ?? [],
                ];
            }
        }

        return Inertia::render('kine-mobile/session-form', [
            'previousSession' => $previousSession,
            'permissions' => [
                'can_create_sessions' => $canCreate,
                'can_view_sessions' => $canView,
                'can_edit_completed_sessions' => $isClinicalAdmin || $user->hasAnyPermission(['treatment-sessions.manage', 'sessions.manage']),
            ],
            'session' => $session ? [
                'id' => $session->id,
                'patient_id' => $session->patient_id,
                'treatment_id' => $session->treatment_id,
                'item_id' => $session->item_id,
                'notes' => $session->notes,
                'subjective' => $session->subjective,
                'objective' => $session->objective,
                'assessment' => $session->assessment,
                'plan' => $session->plan,
                'homework' => $session->homework,
                'next_goals' => $session->next_goals,
                'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->value : $session->status,
                'date' => $session->date->toDateString(),
                'time' => $session->time->format('H:i'),
                'patient' => [
                    'id' => $session->patient->id,
                    'name' => $session->patient->full_name,
                    'rut' => $session->patient->rut,
                ],
                'treatment' => [
                    'diagnosis' => $session->treatment?->referral_diagnosis ?? 'Sin diagnóstico',
                ],
                'item' => [
                    'id' => $session->item?->id,
                    'name' => $session->item?->name,
                    'service_detail' => [
                        'is_evaluation' => (bool) $session->item?->serviceDetail?->is_evaluation,
                    ]
                ],
                'session_type_name' => $session->item?->name ?? 'Servicio',
                'arancel' => (int) $session->patient_amount_clp,
                'pain_before' => $session->pain_before,
                'pain_after' => $session->pain_after,
                'evaluation_data' => $session->evaluation_data ?? [
                    'rom' => [
                        'Flexión' => ['before' => $session->rom_flexion_before, 'after' => $session->rom_flexion_after],
                        'Abducción' => ['before' => $session->rom_abduction_before, 'after' => $session->rom_abduction_after],
                        'Rotación' => ['before' => $session->rom_rotation_before, 'after' => $session->rom_rotation_after],
                    ]
                ],
                'activities_data' => $session->activities_data ?? [
                    'techniques' => $session->techniques ?? [],
                    'exercises' => $session->exercises ?? [],
                ],
                'session_pain_map' => $session->session_pain_map ?? [],
                'body_part' => $session->body_part,
                'laterality' => $session->laterality,
                'informed_consent_confirmed' => (bool)$session->informed_consent_confirmed,
            ] : null,
            'appointment' => $appointment ? [
                'id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'item_id' => $appointment->item_id,
            ] : null,
            'patients' => $patients,
            'treatments' => $treatments,
            'items' => $items,
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name . ' ' . $doctor->last_name,
            ]
        ]);
    }

    /**
     * Ver detalle de una sesión o cita (Mobile)
     */
    public function show($id)
    {
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_view_sessions'] ?? true)) {
            abort(403, 'No tienes permiso para ver el detalle de las sesiones.');
        }

        $permissions = [
            'can_create_sessions' => $isClinicalAdmin || ($doctorBranch['can_create_sessions'] ?? true),
            'can_view_sessions'   => $isClinicalAdmin || ($doctorBranch['can_view_sessions'] ?? true),
            'can_edit_completed_sessions' => $isClinicalAdmin || $user->hasAnyPermission(['treatment-sessions.manage', 'sessions.manage']),
        ];

        // 1. Intentar buscar como Sesión de Tratamiento (sin restringir por doctor_id, pero asegurando acceso al paciente)
        $session = TreatmentSession::with(['patient', 'treatment', 'item', 'branch'])
            ->find($id);

        if ($session) {
            // Verificar acceso al paciente: Solo si no es admin y no tiene permiso de ver todo
            $canViewAll = $isClinicalAdmin || ($doctorBranch['can_view_sessions'] ?? true);
            if (!$canViewAll && !$doctor->patients->contains($session->patient_id)) {
                abort(403, 'No tienes acceso a este paciente');
            }

            $session->load(['doctor', 'invoiceItems.invoice']);
            return Inertia::render('kine-mobile/session-detail', [
                'session' => [
                    'id' => $session->id,
                    'is_appointment' => false,
                    'date' => $session->date->toDateString(),
                    'time' => $session->time->format('H:i'),
                    'status' => $session->status instanceof \App\Enums\AppointmentStatusEnum ? $session->status->value : $session->status,
                    'notes' => $session->notes,
                    'subjective' => $session->subjective,
                    'objective' => $session->objective,
                    'assessment' => $session->assessment,
                    'plan' => $session->plan,
                    'pain_before' => $session->pain_before,
                    'pain_after' => $session->pain_after,
                    'rom_flexion_before' => $session->rom_flexion_before,
                    'rom_flexion_after' => $session->rom_flexion_after,
                    'rom_abduction_before' => $session->rom_abduction_before,
                    'rom_abduction_after' => $session->rom_abduction_after,
                    'rom_rotation_before' => $session->rom_rotation_before,
                    'rom_rotation_after' => $session->rom_rotation_after,
                    'session_pain_map' => $session->session_pain_map ?? [],
                    'body_part' => $session->body_part,
                    'laterality' => $session->laterality,
                    'techniques' => $session->techniques ?? [],
                    'exercises' => $session->exercises ?? [],
                    'duration_actual' => $session->duration,
                    'doctor' => [
                        'id' => $session->doctor->id,
                        'name' => $session->doctor->full_name,
                    ],
                    'patient' => [
                        'id' => $session->patient->id,
                        'name' => $session->patient->full_name,
                        'rut' => $session->patient->rut,
                        'phone' => $session->patient->phone,
                    ],
                    'treatment' => [
                        'id' => $session->treatment_id,
                        'diagnosis' => $session->treatment?->referral_diagnosis ?? 'Sin diagnóstico',
                    ],
                    'session_type' => [
                        'name' => $session->item?->name ?? 'Servicio',
                        'duration' => $session->item?->serviceDetail?->duration_minutes ?? 45,
                    ],
                    'payment' => [
                        'patient_amount_clp' => $session->patient_amount_clp,
                        'doctor_amount_clp' => $session->doctor_amount_clp,
                        'total_paid' => (int) $session->invoiceItems->sum(fn($ii) => $ii->invoice ? $ii->invoice->amount_paid : 0),
                        'is_paid' => $session->invoiceItems->every(fn($ii) => $ii->invoice && $ii->invoice->payment_status === 'paid'),
                    ],
                ],
                'permissions' => $permissions,
            ]);
        }

        // 2. Si no es sesión, buscar como Cita (Appointment)
        $appointment = \App\Models\Appointment::with(['patient', 'item'])
            ->where('doctor_id', $doctor->id)
            ->find($id);

        if ($appointment) {
            return Inertia::render('kine-mobile/session-detail', [
                'session' => [
                    'id' => $appointment->id,
                    'is_appointment' => true,
                    'date' => $appointment->start_at->toDateString(),
                    'time' => $appointment->start_at->format('H:i'),
                    'status' => $appointment->status instanceof \App\Enums\AppointmentStatusEnum ? $appointment->status->value : $appointment->status,
                    'notes' => $appointment->notes,
                    'duration_actual' => 45,
                    'patient' => [
                        'id' => $appointment->patient->id,
                        'name' => $appointment->patient->full_name,
                        'rut' => $appointment->patient->rut,
                        'phone' => $appointment->patient->phone,
                    ],
                    'treatment' => null,
                    'session_type' => [
                        'name' => $appointment->item?->name ?? 'Servicio',
                        'duration' => 45,
                    ],
                    'payment' => null,
                ],
                'permissions' => $permissions,
            ]);
        }

        abort(404, 'Cita o Sesión no encontrada.');
    }

    /**
     * Inicia formalmente la atención (Cita -> Sesión En Curso)
     */
    public function startSession(Request $request, $id)
    {
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_create_sessions'] ?? true)) {
            abort(403, 'No tienes permiso para realizar esta acción clínica.');
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($id, $doctor, $isClinicalAdmin, $doctorBranch) {
            $canCreateAll = $isClinicalAdmin || ($doctorBranch['can_create_sessions'] ?? true);
            
            // 1. Intentar como Cita (Appointment)
            $appointmentQuery = \App\Models\Appointment::whereIn('status', [\App\Enums\AppointmentStatusEnum::SCHEDULED, \App\Enums\AppointmentStatusEnum::CHECKED_IN, \App\Enums\AppointmentStatusEnum::IN_PROGRESS]);
            
            if (!$canCreateAll) {
                $appointmentQuery->where('doctor_id', $doctor->id);
            }
            
            $appointment = $appointmentQuery->find($id);

            if ($appointment) {
                // ... (rest of appointment logic remains same)
                $treatment = Treatment::where('patient_id', $appointment->patient_id)
                    ->where('item_id', $appointment->item_id)
                    ->where('status', \App\Enums\TreatmentStatusEnum::IN_PROGRESS)
                    ->first();

                if (!$treatment) {
                    $treatment = Treatment::create([
                        'company_id' => $appointment->company_id,
                        'branch_id' => $appointment->branch_id,
                        'patient_id' => $appointment->patient_id,
                        'doctor_id' => $appointment->doctor_id,
                        'item_id' => $appointment->item_id,
                        'status' => \App\Enums\TreatmentStatusEnum::IN_PROGRESS,
                        'start_date' => now(),
                        'diagnosis' => 'Ingreso por Agenda',
                    ]);
                }

                $appointment->update([
                    'status' => \App\Enums\AppointmentStatusEnum::IN_PROGRESS,
                    'check_in_at' => $appointment->check_in_at ?? now(),
                    'started_at' => $appointment->started_at ?? now(),
                ]);

                $session = TreatmentSession::updateOrCreate(
                    ['appointment_id' => $appointment->id],
                    [
                        'company_id' => $appointment->company_id,
                        'branch_id' => $appointment->branch_id,
                        'patient_id' => $appointment->patient_id,
                        'doctor_id' => $appointment->doctor_id,
                        'treatment_id' => $treatment->id,
                        'item_id' => $appointment->item_id,
                        'date' => $appointment->start_at->toDateString(),
                        'time' => $appointment->start_at->toTimeString(),
                        'status' => \App\Enums\AppointmentStatusEnum::IN_PROGRESS,
                        'started_at' => now(),
                        'checked_in_at' => $appointment->check_in_at,
                    ]
                );

                return redirect()->route('kine.sessions.form', $session->id)
                    ->with('success', 'Sesión iniciada correctamente');
            }

            // 2. Intentar como Sesión existente
            $sessionQuery = TreatmentSession::query();
            if (!$canCreateAll) {
                $sessionQuery->where('doctor_id', $doctor->id);
            }
            $session = $sessionQuery->find($id);

            if ($session) {
                if ($session->status !== \App\Enums\AppointmentStatusEnum::COMPLETED) {
                    $session->update([
                        'status' => \App\Enums\AppointmentStatusEnum::IN_PROGRESS,
                        'started_at' => $session->started_at ?? now(),
                    ]);
                    
                    if ($session->appointment) {
                        $session->appointment->update(['status' => \App\Enums\AppointmentStatusEnum::IN_PROGRESS]);
                    }
                }
                return redirect()->route('kine.sessions.form', $session->id);
            }

            return back()->with('error', 'No se pudo iniciar la sesión.');
        });
    }
    public function cancelSession(Request $request, $id)
    {
        $request->validate(['cancellation_reason' => 'required|string']);
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_create_sessions'] ?? true)) {
            abort(403, 'No tienes permiso para realizar esta acción clínica en esta sucursal.');
        }

        $canCreateAll = $isClinicalAdmin || ($doctorBranch['can_create_sessions'] ?? true);

        // 1. Intentar como Sesión
        $sessionQuery = TreatmentSession::query();
        if (!$canCreateAll) {
            $sessionQuery->where('doctor_id', $doctor->id);
        }
        $session = $sessionQuery->find($id);

        if ($session) {
            if ($session->status === \App\Enums\AppointmentStatusEnum::COMPLETED) {
                return back()->with('error', 'No se puede cancelar una sesión que ya ha sido completada.');
            }
            $session->update([
                'status' => \App\Enums\AppointmentStatusEnum::CANCELLED,
                'cancellation_note' => $request->cancellation_reason,
            ]);
            return back()->with('success', 'Sesión cancelada correctamente');
        }

        // 2. Intentar como Cita
        $appointmentQuery = \App\Models\Appointment::query();
        if (!$canCreateAll) {
            $appointmentQuery->where('doctor_id', $doctor->id);
        }
        $appointment = $appointmentQuery->find($id);

        if ($appointment) {
            $appointment->update([
                'status' => \App\Enums\AppointmentStatusEnum::CANCELLED,
                'notes' => ($appointment->notes ? $appointment->notes . "\n" : "") . "Cancelada: " . $request->cancellation_reason,
            ]);
            return back()->with('success', 'Cita cancelada correctamente');
        }

        return back()->with('error', 'No se encontró la atención');
    }

    /**
     * Actualiza borrador de la sesión o cita (Mobile)
     */
    public function updateNotes(Request $request, $id)
    {
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_create_sessions'] ?? true)) {
            abort(403, 'No tienes permiso para actualizar notas de la sesión.');
        }

        $canCreateAll = $isClinicalAdmin || ($doctorBranch['can_create_sessions'] ?? true);

        $sessionQuery = TreatmentSession::query();
        if (!$canCreateAll) {
            $sessionQuery->where('doctor_id', $doctor->id);
        }
        $session = $sessionQuery->find($id);

        if ($session) {
            // 🛡️ PROTOCOLO DE PERSISTENCIA SOAP: Bloquear edición si ya está completada (a menos que tenga permisos especiales)
            $hasSpecialPermission = $isClinicalAdmin || $user->hasAnyPermission(['treatment-sessions.manage', 'sessions.manage']);

            if ($session->status === \App\Enums\AppointmentStatusEnum::COMPLETED && !$hasSpecialPermission) {
                return back()->with('error', 'No se pueden modificar las notas de una sesión ya completada.');
            }

            $clinicalData = $request->only([
                'pain_before', 'pain_after', 'homework', 'next_goals', 'objectives',
                'session_pain_map', 'body_part', 'laterality', 'informed_consent_confirmed'
            ]);

            // Mapeo unificado para Estándar Profesional
            $clinicalData['evaluation_data'] = $request->evaluation_data;
            $clinicalData['activities_data'] = $request->activities_data;

            // Sincronización para compatibilidad (Legacy)
            if (isset($request->evaluation_data['rom'])) {
                $rom = $request->evaluation_data['rom'];
                $clinicalData['rom_flexion_before']   = $rom['Flexión']['before'] ?? 0;
                $clinicalData['rom_flexion_after']    = $rom['Flexión']['after'] ?? 0;
                $clinicalData['rom_abduction_before'] = $rom['Abducción']['before'] ?? 0;
                $clinicalData['rom_abduction_after']  = $rom['Abducción']['after'] ?? 0;
                $clinicalData['rom_rotation_before']  = $rom['Rotación']['before'] ?? 0;
                $clinicalData['rom_rotation_after']   = $rom['Rotación']['after'] ?? 0;
            }

            if (isset($request->activities_data['techniques'])) {
                $clinicalData['techniques'] = $request->activities_data['techniques'];
            }
            if (isset($request->activities_data['exercises'])) {
                $clinicalData['exercises'] = $request->activities_data['exercises'];
            }

            // Mapeo SOAP
            $clinicalData['subjective'] = $request->subjective_notes ?? $request->subjective;
            $clinicalData['objective'] = $request->objective_notes ?? $request->objective;
            $clinicalData['assessment'] = $request->assessment_notes ?? $request->assessment;
            $clinicalData['plan'] = $request->plan_notes ?? $request->plan;
            $clinicalData['notes'] = $request->notes;

            $session->update($clinicalData);
            return back()->with('success', 'Borrador clínico guardado');
        }

        $appointmentQuery = \App\Models\Appointment::query();
        if (!$canCreateAll) {
            $appointmentQuery->where('doctor_id', $doctor->id);
        }
        $appointment = $appointmentQuery->find($id);

        if ($appointment) {
            $appointment->update([
                'notes' => $request->notes ?? $request->subjective_notes
            ]);
            return back()->with('success', 'Notas de cita actualizadas');
        }

        return back()->with('error', 'Atención no encontrada');
    }

    /**
     * Finaliza la sesion capturando firma o procesando la omision.
     */
    public function completeSession(Request $request, $id)
    {
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_create_sessions'] ?? true)) {
            abort(403, 'No tienes permiso para realizar esta acción clínica en esta sucursal.');
        }

        $session = TreatmentSession::findOrFail($id);
        
        // 🛡️ PROTOCOLO DE PERSISTENCIA SOAP: Si la sesión ya está completada, no permitir re-completar ni modificar datos clínicos (a menos que tenga permisos especiales)
        $hasSpecialPermission = $isClinicalAdmin || $user->hasAnyPermission(['treatment-sessions.manage', 'sessions.manage']);

        if ($session->status === \App\Enums\AppointmentStatusEnum::COMPLETED && !$hasSpecialPermission) {
            return redirect()->route('kine.dashboard')->with('error', 'Esta sesión ya fue completada y sus registros son inmutables.');
        }

        $request->validate([
            'signature_skipped' => 'required|boolean',
            'signature_base64' => 'required_if:signature_skipped,false|string|nullable',
            'gps_coords' => 'nullable|string',
            'skip_reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'pain_before' => 'nullable|integer',
            'pain_after' => 'nullable|integer',
            'techniques' => 'nullable|array',
            'exercises' => 'nullable|array',
            'rom_flexion_before' => 'nullable|integer',
            'rom_flexion_after' => 'nullable|integer',
            'rom_abduction_before' => 'nullable|integer',
            'rom_abduction_after' => 'nullable|integer',
            'rom_rotation_before' => 'nullable|integer',
            'rom_rotation_after' => 'nullable|integer',
            'session_pain_map' => 'nullable|array',
            'body_part' => 'nullable|string|max:100',
            'laterality' => 'nullable|string|max:50',
            'informed_consent_confirmed' => 'nullable|boolean',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $session) {
            
            // 1. Mapeo de Datos Clinicos (SOAP)
            $clinicalData = $request->only([
                'pain_before', 'pain_after', 'homework', 'next_goals', 'objectives',
                'session_pain_map', 'body_part', 'laterality', 'informed_consent_confirmed',
                'subjective', 'objective', 'assessment', 'plan', 'notes'
            ]);

            // Mapeo unificado para Estándar Profesional
            $clinicalData['evaluation_data'] = $request->evaluation_data;
            $clinicalData['activities_data'] = $request->activities_data;

            // Sincronización para compatibilidad (Legacy)
            if (isset($request->evaluation_data['rom'])) {
                $rom = $request->evaluation_data['rom'];
                $clinicalData['rom_flexion_before']   = $rom['Flexión']['before'] ?? 0;
                $clinicalData['rom_flexion_after']    = $rom['Flexión']['after'] ?? 0;
                $clinicalData['rom_abduction_before'] = $rom['Abducción']['before'] ?? 0;
                $clinicalData['rom_abduction_after']  = $rom['Abducción']['after'] ?? 0;
                $clinicalData['rom_rotation_before']  = $rom['Rotación']['before'] ?? 0;
                $clinicalData['rom_rotation_after']   = $rom['Rotación']['after'] ?? 0;
            }

            if (isset($request->activities_data['techniques'])) {
                $clinicalData['techniques'] = $request->activities_data['techniques'];
            }
            if (isset($request->activities_data['exercises'])) {
                $clinicalData['exercises'] = $request->activities_data['exercises'];
            }

            // Fallback para nombres antiguos si fuera necesario
            if (empty($clinicalData['subjective'])) $clinicalData['subjective'] = $request->subjective_notes;
            if (empty($clinicalData['objective'])) $clinicalData['objective'] = $request->objective_notes;
            if (empty($clinicalData['assessment'])) $clinicalData['assessment'] = $request->assessment_notes;
            if (empty($clinicalData['plan'])) $clinicalData['plan'] = $request->plan_notes;
            
            // 2. Procesar Firma (si aplica)
            if ($request->signature_skipped) {
                $clinicalData['signature_skipped'] = true;
                $clinicalData['signature_skip_reason'] = $request->skip_reason ?? 'Paciente de confianza';
            } else if ($request->filled('signature_base64')) {
                try {
                    $imageData = $request->signature_base64;
                    $image = str_replace('data:image/png;base64,', '', $imageData);
                    $image = str_replace(' ', '+', $image);
                    $imageName = 'sig_' . $session->id . '_' . time() . '.png';
                    $path = 'signatures/sessions/' . $imageName;
                    
                    \Illuminate\Support\Facades\Storage::disk('local')->put($path, base64_decode($image));

                    $clinicalData['signature_path'] = $path;
                    $clinicalData['signature_skipped'] = false;
                    $clinicalData['signature_gps_coords'] = $request->gps_coords;
                } catch (\Exception $e) {
                    Log::error("Error procesando firma: " . $e->getMessage());
                    // No bloqueamos el flujo, pero marcamos como omitida
                    $clinicalData['signature_skipped'] = true;
                    $clinicalData['signature_skip_reason'] = "Error tecnico en captura";
                }
            }

            // 3. Finalizar mediante el Servicio (Maneja estados COMPLETED, pagos, etc.)
            $this->sessionService->completeSession($session, $clinicalData);

            if ($session->appointment) {
                $session->appointment->update(['status' => \App\Enums\AppointmentStatusEnum::COMPLETED]);
            }

            return redirect()->route('kine.dashboard')->with('success', 'Sesion finalizada correctamente');
        });
    }
}
