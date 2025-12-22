<?php

namespace App\Http\Controllers\Admin\Plans;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\FamilyPlanService;
use Illuminate\Http\Request;

class FamilyPlanController extends Controller
{
    protected FamilyPlanService $familyService;

    public function __construct(FamilyPlanService $familyService)
    {
        $this->familyService = $familyService;
    }
    // Método para mostrar el modal de asignación (Si fuera una página)
    // Opcional si solo usas un modal

    /**
     * Endpoint para procesar la asignación del plan familiar
     */
    public function assign(Request $request, Plan $plan)
    {
        // 1. Validación de los datos del modal
        $request->validate([
            'holder_id' => ['required', 'exists:patients,id'],
            'beneficiary_ids' => ['nullable', 'array'],
            'beneficiary_ids.*' => ['exists:patients,id'],
        ]);
        
        // 2. Ejecutar la lógica de negocio (incluye la transacción y la unicidad)
        try {
            $this->familyService->assignFamilyPlan(
                $plan,
                $request->holder_id,
                $request->beneficiary_ids ?? []
            );

            return redirect()->back()->with('success', "Plan Familiar asignado correctamente a todos los miembros.");

        } catch (\Exception $e) {
            // Muestra el error de unicidad (Ej: "El paciente ya tiene plan activo...")
            return redirect()->back()->withErrors(['assignment_error' => $e->getMessage()]);
        }
    }
}

