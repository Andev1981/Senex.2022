<?php

namespace App\Http\Controllers\Admin\Plans;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlanRequest;
use App\Http\Requests\UpdatePlanRequest;
use App\Models\Insurance;
use App\Models\Plan;
use App\Services\Plans\PlanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PlanController extends Controller
{

    protected PlanService $planService;

    // Inyección de Dependencias
    public function __construct(PlanService $planService)
    {
        $this->planService = $planService;
    }

    public function index(Request $request, Insurance $insurance = null){
     
        // Si la petición espera JSON y se pide planes internos
        if ($request->wantsJson() && ($request->has('is_internal') || $request->has('search'))) {
            $plansQuery = Plan::with(['insurance', 'agreementRules.sessionType']) // Cargar a través de las reglas del convenio
                ->where('is_active', true);
        
            if ($request->has('is_internal')) {
                $plansQuery->where('type', 'internal');
            }

            if ($request->has('search')) {
                $searchTerm = $request->input('search');
                $plansQuery->where('name', 'LIKE', "%{$searchTerm}%");
            }
            
            $plans = $plansQuery->get()->map(function ($plan) {
                // Mapear las reglas para obtener los nombres de los tipos de sesión
                $sessionTypesNames = $plan->agreementRules->map(function ($rule) {
                    return $rule->sessionType?->name;
                })->filter()->unique()->implode(', ');

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'code' => $plan->code,
                    'price' => $plan->price,
                    'total_sessions' => $plan->total_sessions,
                    'valid_months' => $plan->valid_months,
                    'description' => $plan->description,
                    'insurance_name' => $plan->insurance?->name ?? 'Particular / Interno',
                    'session_types' => $sessionTypesNames, // Usar la nueva variable
                ];
            });

            return response()->json(['plans' => $plans]);
        }

        // Lógica original para la vista Inertia
        if ($insurance) {
            $plans = Plan::with('insurance')
                ->where('insurance_id', $insurance->id)
                ->orderBy('name')
                ->get()
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'code' => $plan->code,
                        'insurance_id' => $plan->insurance_id,
                        'insurance' => [ 
                            'id' => $plan->insurance->id ?? null,
                            'name' => $plan->insurance->name ?? 'Particular', 
                            'institution_type' => $plan->insurance->institution_type ?? null,
                        ],
                        'coverage_percentage' => $plan->coverage_percentage,
                        'type' => $plan->type,
                        'total_sessions' => $plan->total_sessions,
                        'price' => $plan->price,
                        'valid_months' => $plan->valid_months,
                        'start_date' => $plan->start_date,
                        'end_date' => $plan->end_date,
                        'description' => $plan->description,
                        'is_active' => $plan->is_active,
                    ];
                });

            return Inertia::render('plans/Index', [
                'plans' => $plans,
                'insurance' => $insurance
            ]);
        }
        
        // Fallback si no se provee ni JSON ni insurance, podría devolver todos los planes o una vista genérica.
        // Por ahora, devolvemos una vista genérica de planes.
        $allPlans = Plan::with('insurance')->orderBy('name')->get();
        return Inertia::render('plans/Index', [
            'plans' => $allPlans,
            'insurance' => null
        ]);
    }

    public function store(StorePlanRequest $request)
    {
       
        $validated = $request->validated();

        try {

            // 2. DELEGAR la lógica al Service Layer
            $plan = $this->planService->createPlanWithContent(
                 $validated
            );

            //code...
            /* Plan::create($validated); */

            
            // Si llegamos aquí, la transacción fue exitosa
            session()->flash('message', 'Plan creado correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $th) {
            Log::error("Error al crear el Plan:", [
                'user_id' => auth()->id(), // Si usas autenticación
                'exception' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
            ]);

            // 2. Mostrar el mensaje específico de la excepción al usuario
            // Solo mostrar el getMessage() si es seguro y relevante para el usuario.
            $errorMessage = "La creación ha fallado. Razón: " . $th->getMessage();

            // En un entorno de producción, a veces quieres mostrar un mensaje más amigable
            // si el error es de bajo nivel (ej. "Error de conexión").
            /**/
            if (app()->environment('production')) {
                $errorMessage = 'La creación ha fallado debido a un error del sistema. Por favor, intente de nuevo.';
            } else {
                $errorMessage = $th->getMessage();
            }
            
            
            session()->flash('message', $errorMessage);
            session()->flash('type', 'error');
        }

    }

    public function update(UpdatePlanRequest $request, Plan $plan)
    {
        $validated = $request->validated();
        try{

        $plan->update($validated);
        // Si llegamos aquí, la transacción fue exitosa
            session()->flash('message', 'Plan actualizado correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $th) {
                    Log::error("Error al actualizar el Plan:", [
                        'user_id' => auth()->id(), // Si usas autenticación
                        'exception' => $th->getMessage(),
                        'trace' => $th->getTraceAsString(),
                    ]);

                    // 2. Mostrar el mensaje específico de la excepción al usuario
                    // Solo mostrar el getMessage() si es seguro y relevante para el usuario.
                    $errorMessage = "La actualización ha fallado. Razón: " . $th->getMessage();

                    // En un entorno de producción, a veces quieres mostrar un mensaje más amigable
                    // si el error es de bajo nivel (ej. "Error de conexión").
                    /**/
                    if (app()->environment('production')) {
                        $errorMessage = 'La actualización ha fallado debido a un error del sistema. Por favor, intente de nuevo.';
                    } else {
                        $errorMessage = $th->getMessage();
                    }
                    
                    
                    session()->flash('message', $errorMessage);
                    session()->flash('type', 'error');
                }
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return redirect()->route('plans.index')
            ->with('success', 'Plan deleted successfully.');
    }

    
}