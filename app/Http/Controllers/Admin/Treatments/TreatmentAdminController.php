<?php

namespace App\Http\Controllers\Admin\Treatments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreatmentRequest;
use App\Http\Requests\UpdateTreatmentRequest;
use App\Models\Commune;
use App\Models\Diagnostic;
use App\Models\Doctor;
use App\Models\Treatment;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\TreatmentSession;
use App\Services\Treatments\TreatmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class TreatmentAdminController extends Controller
{
    /**
     * INDEX - GET /patients/{patient}/treatments
     * Retorna vista Inertia para mostrar lista de tratamientos
     */
    public function index(Patient $patient): Response
    {
        $activeBranchId = session('active_branch_id');
        $companyId = session('current_company_id');

        $treatments = Treatment::where('patient_id', $patient->id)
            ->where('branch_id', $activeBranchId)
            ->with(['sessionType', 'doctor', 'sessions', 'sessions.doctor'])
            ->orderBy('created_at', 'desc')
            ->get();


        $sessions = TreatmentSession::where('patient_id', $patient->id)
            ->where('branch_id', $activeBranchId)
            ->with(['doctor', 'treatment', 'debt'])
            ->orderBy('date', 'desc')
            ->get();

        $payments = Payment::where('patient_id', $patient->id)->where('status', 'completed')
            ->where('branch_id', $activeBranchId)
            ->orderBy('created_at', 'desc')
            ->get();

        $patient->load([
            'address.region',
            'address.province',
            'address.commune',
            'latestVital',
        ]);

        $address = $patient->address;

        $contact = $patient->primaryContact;

        $allergies = $patient->allergies;

        $conditions = $patient->condition;

        $vital = $patient->latestVital;

        $session_types = SessionType::where('branch_id', $activeBranchId)->get();


        // Solo doctores de esta empresa
        $doctors = Doctor::whereHas('companies', function ($q) use ($companyId) {
            $q->where('companies.id', $companyId);
        })->select('id', 'name', 'last_name')->get();



        return Inertia::render('Patients/DetailPatient', [
            'patient' => $patient,
            'treatments' => $treatments,
            'sessions' => $sessions,
            'payments' => $payments,
            'address' => $address,
            'vital' => $vital,
            'doctors' => $doctors,
            'session_types' => $session_types,
            'contact' => $contact,
            'allergies' => $allergies,
            'conditions' => $conditions,
            'regions'     => Region::all(['id', 'name']),
            'provinces'   => Province::all(['id', 'name', 'region_id']),
            'communes'    => Commune::all(['id', 'name', 'province_id']),

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
            'sessionType',
            'doctor',
            'sessions' => function ($query) {
                $query->orderBy('date', 'desc');
            }
        ]);

        return Inertia::render('Patients/Treatments/Show', [
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
            $treatmentService->createTreatment($request->validated());

            // Si llegamos aquí, la transacción fue exitosa
            session()->flash('message', 'Tratamiento creado correctamente.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            // Manejo de errores de la lógica de negocio
            Log::error('Error creando tratamiento: ' . $e->getMessage());

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
            ->with(['sessionType', 'doctor']);

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
