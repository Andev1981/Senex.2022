<?php

namespace App\Http\Controllers\Admin\Treatments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreatmentRequest;
use App\Http\Requests\UpdateTreatmentRequest;
use App\Models\Treatment;
use App\Models\Patient;
use App\Services\Treatments\TreatmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class TreatmentAdminController extends Controller
{
    /**
     * Inyectar el service en el constructor
     */
    public function __construct(
        private TreatmentService $treatmentService,
    ) {}

    /**
     * STORE - POST /treatments
     * Retorna JsonResponse para manejo desde formularios modales
     */
    public function store(StoreTreatmentRequest $request)
    {
        try {

            // El Controller delega toda la lógica de negocio al Service
            $this->treatmentService->createTreatment($request->validated());
            return back();
            /* return response()->json([
                'message' => 'Tratamiento creado exitosamente.',
            ], 200); */
        } catch (\Exception $e) {
            // Manejo de errores de la lógica de negocio
            Log::error('Error creando tratamiento: ' . $e->getMessage());
            return back();
            /* return response()->json(['error' => $e->getMessage()], 400); */
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
