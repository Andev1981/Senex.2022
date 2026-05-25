<?php
// app/Http/Controllers/KineMobile/PatientController.php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PatientMobileController extends Controller
{
    /**
     * Lista de pacientes asignados al kine
     */
    public function index(Request $request): Response
    {
        $doctor = Auth::user()->doctor;
        $search = $request->input('search', '');

        $query = $doctor->patients()
            ->with([
                'treatments' => function ($q) use ($doctor) {
                    $q->where('treatments.doctor_id', $doctor->id)
                        ->whereIn('treatments.status', [
                            \App\Enums\TreatmentStatusEnum::IN_PROGRESS,
                            \App\Enums\TreatmentStatusEnum::EVALUATION,
                            \App\Enums\TreatmentStatusEnum::COMPLETED
                        ])
                        ->with('item:id,name')
                        ->latest();
                }
            ])
            ->withCount([
                'sessions as total_sessions' => function ($q) use ($doctor) {
                    $q->where('treatment_sessions.doctor_id', $doctor->id);
                },
                'sessions as completed_sessions' => function ($q) use ($doctor) {
                    $q->where('treatment_sessions.doctor_id', $doctor->id)
                        ->where('treatment_sessions.status', \App\Enums\AppointmentStatusEnum::COMPLETED);
                }
            ]);

        // Búsqueda
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('rut', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $patients = $query->orderBy('name')->get()->map(function ($patient) {
            $activeTreatment = $patient->treatments->first();

            return [
                'id' => $patient->id,
                'name' => $patient->name . ' ' . $patient->last_name,
                'phone' => $patient->phone,
                'rut' => $patient->rut,
                'total_sessions' => $patient->total_sessions,
                'completed_sessions' => $patient->completed_sessions,
                'active_treatment' => $activeTreatment ? [
                    'id' => $activeTreatment->id,
                    'diagnosis' => $activeTreatment->diagnosis,
                    'session_type' => $activeTreatment->item->name,
                    'status' => $activeTreatment->status->value,
                    'progress' => $activeTreatment->completed_sessions . '/' . ($activeTreatment->total_sessions ?? '∞'),
                ] : null,
            ];
        });

        $upcomingAppointments = \App\Models\Appointment::where('doctor_id', $doctor->id)
            ->where('start_at', '>=', now())
            ->whereIn('status', [
                \App\Enums\AppointmentStatusEnum::SCHEDULED,
                \App\Enums\AppointmentStatusEnum::CONFIRMED,
                \App\Enums\AppointmentStatusEnum::CHECKED_IN,
                \App\Enums\AppointmentStatusEnum::IN_PROGRESS
            ])
            ->with(['patient', 'item'])
            ->orderBy('start_at', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'patient_name' => $apt->patient->full_name,
                    'patient_id' => $apt->patient_id,
                    'date' => $apt->start_at->toDateString(),
                    'time' => $apt->start_at->format('H:i'),
                    'status' => $apt->status instanceof \App\Enums\AppointmentStatusEnum ? $apt->status->value : $apt->status,
                    'service_name' => $apt->item?->name ?? 'Servicio',
                ];
            });

        return Inertia::render('kine-mobile/my-patients', [
            'patients' => $patients,
            'search' => $search,
            'totalPatients' => $patients->count(),
            'upcomingAppointments' => $upcomingAppointments,
        ]);
    }

    /**
     * Detalle de un paciente específico
     */
    public function show(Patient $patient): Response
    {
        $doctor = Auth::user()->doctor;
        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        $canViewAll = $isClinicalAdmin || ($doctorBranch['can_view_sessions'] ?? true);

        // Verificar acceso al paciente
        if (!$canViewAll && !$doctor->patients->contains($patient->id)) {
            abort(403, 'No tienes acceso a este paciente');
        }

        // Cargar datos del paciente
        $patient->load([
            'medicalHistory',
            'treatments' => function ($q) {
                $q->with('item:id,name')
                    ->latest();
            },
            'sessions' => function ($q) {
                $q->with('item:id,name')
                    ->latest()
                    ->limit(20);
            },
            'contacts' => function ($q) {
                $q->where('is_primary', true);
            }
        ]);

        $doctorBranch = $doctor->getBranchAttribute();
        $permissions = [
            'can_create_sessions' => $doctorBranch['can_create_sessions'] ?? true,
            'can_view_sessions'   => $doctorBranch['can_view_sessions'] ?? true,
        ];

        return Inertia::render('kine-mobile/patient-detail', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name . ' ' . $patient->last_name,
                'rut' => $patient->rut,
                'phone' => $patient->phone,
                'email' => $patient->email,
                'birth_date' => $patient->birth_date,
                'gender' => $patient->gender,
                'medical_history' => $patient->medicalHistory,
                'emergency_contact' => $patient->contacts->first(),
                'treatments' => $patient->treatments->map(function ($treatment) {
                    return [
                        'id' => $treatment->id,
                        'diagnosis' => $treatment->diagnosis,
                        'session_type' => $treatment->item->name,
                        'start_date' => $treatment->start_date,
                        'status' => $treatment->status,
                        'progress' => [
                            'completed' => $treatment->completed_sessions,
                            'total' => $treatment->total_sessions,
                            'percentage' => $treatment->total_sessions > 0
                                ? round(($treatment->completed_sessions / $treatment->total_sessions) * 100)
                                : 0,
                        ],
                    ];
                }),
                'recent_sessions' => $patient->sessions->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'date' => $session->date,
                        'time' => $session->time ? $session->time->format('H:i') : null,
                        'session_type' => $session->item->name,
                        'status' => $session->status,
                        'notes' => $session->notes,
                    ];
                }),
            ],
            'permissions' => $permissions,
        ]);
    }
}
