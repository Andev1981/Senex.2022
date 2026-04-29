<?php

namespace App\Http\Controllers\Admin\Treatments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreatmentRequest;
use App\Http\Requests\UpdateTreatmentRequest;
use App\Models\Commune;
use App\Models\Doctor;
use App\Models\Treatment;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Province;
use App\Models\Region;
use App\Models\Item;
use App\Models\TreatmentSession;
use App\Services\Treatments\TreatmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class TreatmentController extends Controller
{
    /**
     * INDEX - GET /patients/{patient}/treatments
     * Retorna vista Inertia para mostrar lista de tratamientos
     */
    public function index(Patient $patient): Response
    {
        $treatments = Treatment::where('patient_id', $patient->id)
            ->with(['item', 'doctor', 'sessions', 'sessions.doctor'])
            ->orderBy('created_at', 'desc')
            ->get();

        $sessions = TreatmentSession::where('patient_id', $patient->id)
            ->with(['doctor', 'treatment'])
            ->orderBy('date', 'desc')
            ->get();

        $payments = Payment::where('patient_id', $patient->id)->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        $patient->load([
            'address.region',
            'address.province',
            'address.commune',
            'latestVitalSign',
        ]);

        $address = $patient->address;

        $contact = $patient->primaryContact;

        $allergies = $patient->allergies;

        $conditions = $patient->condition;

        $vital = $patient->latestVitalSign;

        $items = Item::all();

        $provinces = Province::all();
        $communes  = Commune::all();
        $regions   = Region::all();
        $doctors   = Doctor::all();


        return Inertia::render('patients/detail-patient', [
            'patient' => $patient,
            'treatments' => $treatments,
            'sessions' => $sessions,
            'payments' => $payments,
            'provinces' => $provinces,
            'communes' => $communes,
            'regions' => $regions,
            'address' => $address,
            'vital' => $vital,
            'doctors' => $doctors,
            'items' => $items,
            'contact' => $contact,
            'allergies' => $allergies,
            'conditions' => $conditions,
        ]);
    }

    /**
     * SHOW - GET /treatments/{treatment}
     * Retorna vista Inertia para mostrar un tratamiento específico
     */
    public function show(Treatment $treatment): Response
    {
        $treatment->load([
            'patient',
            'item',
            'doctor',
            'sessions' => function ($query) {
                $query->orderBy('date', 'desc');
            }
        ]);

        return Inertia::render('patients/Treatments/Show', [
            'treatment' => $treatment,
        ]);
    }

    /**
     * STORE - POST /treatments
     * Retorna JsonResponse para manejo desde formularios modales
     */
    public function store(StoreTreatmentRequest $request, TreatmentService $treatmentService)
    {
        try {
            // El Controller delega toda la lógica de negocio al Service
            /*  $treatment = $treatmentService->createTreatmentWithSession($request->validated()); */

            // Si llegamos aquí, la transacción fue exitosa
            session()->flash('message', 'Tratamiento y primera sesión creados correctamente.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            // Manejo de errores de la lógica de negocio
            Log::error('Error creando tratamiento con sesión: ' . $e->getMessage());

            session()->flash('message', 'Error al crear el tratamiento. ' . $e->getMessage());
            session()->flash('type', 'error');
        }
    }

    /**
     * UPDATE - PUT/PATCH /treatments/{treatment}
     * Retorna JsonResponse para manejo desde formularios modales
     */
    public function update(UpdateTreatmentRequest $request, Treatment $treatment)
    {

        try {
            $treatment->update($request->validated());

            if (!$treatment) {
                session()->flash('message', 'Tratamiento no ha podido ser actualizado.');
                session()->flash('type', 'error');
            }

            session()->flash('message', 'Tratamiento actualizado.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            if (!$treatment) {
                session()->flash('message', 'Tratamiento no se pudo actualizar.');
                session()->flash('type', 'error');
            }
        }
    }

    /**
     * DESTROY - DELETE /treatments/{treatment}
     * Retorna JsonResponse para manejo desde modales
     */
    public function destroy(Treatment $treatment)
    {
        try {
            // No permitir eliminar si tiene sesiones completadas
            $completedSessions = $treatment->sessions()->completed()->count();

            if ($completedSessions > 0) {

                session()->flash('message', 'No se puede eliminar un tratamiento con sesiones completadas.');
                session()->flash('type', 'error');
            }

            $treatment->delete();

            session()->flash('message', 'Eliminado correctamente.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            session()->flash('message', 'No se puede eliminar tratamiento.');
            session()->flash('type', 'error');
        }
    }

    /**
     * AJAX - GET /api/patients/{patient}/treatments
     * Para búsquedas y filtrados en tiempo real
     */
    public function apiIndex(Request $request, Patient $patient)
    {
        $query = Treatment::where('patient_id', $patient->id)
            ->with(['item', 'doctor']);

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('diagnosis', 'like', "%{$search}%");
            });
        }

        $treatments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'treatments' => $treatments,
        ]);
    }

    /**
     * UPDATE KPIs - PUT /api/treatments/{treatment}/kpis
     * Endpoint específico para actualizar KPIs desde modal
     */
    public function updateKPIs(UpdateTreatmentRequest $request, Treatment $treatment): JsonResponse
    {
        try {
            // Solo actualizar campos de KPIs
            $kpiData = Arr::only($request->validated(), ['pain_reduction', 'mobility_improvement', 'strength_gain', 'completed_sessions', 'total_sessions']);
            $treatment->update($kpiData);

            return response()->json([
                'success' => true,
                'message' => 'KPIs actualizados exitosamente',
                'treatment' => $treatment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar KPIs: ' . $e->getMessage(),
                'errors' => ['general' => ['Error interno del servidor']],
            ], 500);
        }
    }

    /**
     * RECALCULATE KPIs - POST /api/treatments/{treatment}/recalculate-kpis
     * Recalcular KPIs basados en sesiones completadas
     */
    public function recalculateKPIs(Treatment $treatment): JsonResponse
    {
        try {
            $kpis = $treatment->calculateKPIs();
            $treatment->update($kpis);

            return response()->json([
                'success' => true,
                'message' => 'KPIs recalculados exitosamente',
                'treatment' => $treatment->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al recalcular KPIs: ' . $e->getMessage(),
                'errors' => ['general' => ['Error interno del servidor']],
            ], 500);
        }
    }
}
