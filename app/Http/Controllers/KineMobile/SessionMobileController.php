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

class SessionMobileController extends Controller
{
    /**
     * Muestra el formulario para crear o editar una sesión (Mobile)
     */
    public function showForm(Request $request, $id = null)
    {
        $user = auth()->user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        // Obtener pacientes asignados al doctor
        $patients = $doctor->patients()
            ->select('patients.id', 'patients.name', 'patients.last_name', 'patients.rut')
            ->get();

        // Obtener tratamientos activos del doctor
        $treatments = Treatment::with('item')
            ->where('doctor_id', $doctor->id)
            ->where('status', \App\Enums\TreatmentStatusEnum::IN_PROGRESS)
            ->get()
            ->map(function ($treatment) {
                return [
                    'id' => $treatment->id,
                    'patient_id' => $treatment->patient_id,
                    'diagnosis' => $treatment->diagnosis,
                    'item_id' => $treatment->item_id,
                    'session_type_name' => $treatment->item?->name ?? 'Tipo desconocido',
                ];
            });

        // Obtener catálogo de servicios (Servicios médicos)
        $items = Item::services()
            ->with('serviceDetail')
            ->get(['id', 'name', 'price'])
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (int)$item->price,
                    'duration' => $item->serviceDetail?->duration_minutes ?? 45
                ];
            });

        return Inertia::render('kine-mobile/session-form', [
            'session' => null,
            'patients' => $patients,
            'treatments' => $treatments,
            'items' => $items,
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name . ' ' . $doctor->last_name,
                'commission_rates' => $doctor->commissionRates->map(function ($rate) {
                    return [
                        'item_id' => $rate->item_id,
                        'commission_type' => $rate->commission_type,
                        'amount_clp' => $rate->amount_clp,
                        'commission_percentage' => $rate->commission_percentage
                    ];
                })
            ]
        ]);
    }

    /**
     * Ver detalle de una sesión (Mobile)
     */
    public function show(TreatmentSession $session)
    {
        $session->load(['patient', 'treatment', 'item']);
        
        return Inertia::render('kine-mobile/session-detail', [
            'session' => [
                'id' => $session->id,
                'date' => $session->date->toDateString(),
                'time' => $session->time->format('H:i'),
                'status' => $session->status,
                'notes' => $session->notes,
                'duration_actual' => $session->duration,
                'patient' => [
                    'id' => $session->patient->id,
                    'name' => $session->patient->name . ' ' . $session->patient->last_name,
                    'rut' => $session->patient->rut,
                    'phone' => $session->patient->phone,
                ],
                'treatment' => [
                    'id' => $session->treatment->id,
                    'diagnosis' => $session->treatment->referral_diagnosis,
                    'objectives' => [], // Si tienes un campo de objetivos, cárgalo aquí
                ],
                'session_type' => [
                    'name' => $session->item->name,
                    'duration' => $session->item->serviceDetail?->duration_minutes ?? 45,
                ],
                'payment' => [
                    'doctor_amount_clp' => $session->doctor_amount_clp,
                ],
                'timestamps' => [
                    'created_at' => $session->created_at,
                    'completed_at' => $session->signed_at, // O el timestamp que uses para completar
                ]
            ]
        ]);
    }

    /**
     * Cancela una sesión (Mobile)
     */
    public function cancelSession(Request $request, TreatmentSession $session)
    {
        $request->validate(['cancellation_reason' => 'required|string']);

        $session->update([
            'status' => \App\Enums\AppointmentStatusEnum::CANCELLED,
            'cancellation_note' => $request->cancellation_reason,
        ]);

        return response()->json(['success' => true, 'message' => 'Sesión cancelada']);
    }

    /**
     * Actualiza solo las notas de la sesión (Mobile)
     */
    public function updateNotes(Request $request, TreatmentSession $session)
    {
        $request->validate(['notes' => 'required|string']);

        $session->update(['notes' => $request->notes]);

        return response()->json(['success' => true, 'message' => 'Notas actualizadas']);
    }

    /**
     * Finaliza la sesión capturando firma o procesando la omisión.
     */
    public function completeSession(Request $request, TreatmentSession $session)
    {
        $request->validate([
            'signature_skipped' => 'required|boolean',
            'signature_base64' => 'required_if:signature_skipped,false|string|nullable',
            'gps_coords' => 'nullable|string',
            'skip_reason' => 'nullable|string|max:255',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $session) {
            
            if ($request->signature_skipped) {
                $session->update([
                    'signature_skipped' => true,
                    'signature_skip_reason' => $request->skip_reason ?? 'Paciente de confianza',
                    'status' => \App\Enums\AppointmentStatusEnum::COMPLETED,
                ]);
            } else {
                // Procesar imagen Base64
                $imageData = $request->signature_base64;
                $image = str_replace('data:image/png;base64,', '', $imageData);
                $image = str_replace(' ', '+', $image);
                $imageName = 'sig_' . $session->id . '_' . time() . '.png';
                $path = 'signatures/sessions/' . $imageName;
                
                \Illuminate\Support\Facades\Storage::disk('local')->put($path, base64_decode($image));

                $session->update([
                    'signature_path' => $path,
                    'signature_skipped' => false,
                    'signed_at' => now(),
                    'signature_gps_coords' => $request->gps_coords,
                    'status' => \App\Enums\AppointmentStatusEnum::COMPLETED,
                ]);
            }

            // Incrementar sesiones en el tratamiento principal
            if ($session->treatment) {
                $session->treatment->incrementCompletedSessions();
            }

            return response()->json([
                'success' => true,
                'message' => 'Sesión finalizada correctamente'
            ]);
        });
    }
}
