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

class PatientController extends Controller
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
                    $q->where('doctor_id', $doctor->id)
                        ->where('status', 'InProgress')
                        ->with('sessionType:id,name');
                }
            ])
            ->withCount([
                'sessions as total_sessions' => function ($q) use ($doctor) {
                    $q->where('doctor_id', $doctor->id);
                },
                'sessions as completed_sessions' => function ($q) use ($doctor) {
                    $q->where('doctor_id', $doctor->id)
                        ->where('status', 'completed');
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
                    'session_type' => $activeTreatment->sessionType->name,
                    'progress' => $activeTreatment->completed_sessions . '/' . ($activeTreatment->total_sessions ?? '∞'),
                ] : null,
            ];
        });

        return Inertia::render('KineMobile/MyPatients', [
            'patients' => $patients,
            'search' => $search,
            'totalPatients' => $patients->count(),
        ]);
    }

    /**
     * Detalle de un paciente específico
     */
    public function show(Patient $patient): Response
    {
        $doctor = Auth::user()->doctor;

        // Verificar que el paciente esté asignado al kine
        if (!$doctor->patients->contains($patient->id)) {
            abort(403, 'No tienes acceso a este paciente');
        }

        // Cargar datos del paciente
        $patient->load([
            'treatments' => function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                    ->with('sessionType:id,name')
                    ->latest();
            },
            'sessions' => function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                    ->with('sessionType:id,name')
                    ->latest()
                    ->limit(20);
            },
            'contacts' => function ($q) {
                $q->where('is_primary', true);
            }
        ]);

        return Inertia::render('KineMobile/PatientDetail', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name . ' ' . $patient->last_name,
                'rut' => $patient->rut,
                'phone' => $patient->phone,
                'email' => $patient->email,
                'birth_date' => $patient->birth_date,
                'gender' => $patient->gender,
                'emergency_contact' => $patient->contacts->first(),
                'treatments' => $patient->treatments->map(function ($treatment) {
                    return [
                        'id' => $treatment->id,
                        'diagnosis' => $treatment->diagnosis,
                        'session_type' => $treatment->sessionType->name,
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
                        'time' => $session->time,
                        'session_type' => $session->sessionType->name,
                        'status' => $session->status,
                        'notes' => $session->notes,
                    ];
                }),
            ],
        ]);
    }
}
