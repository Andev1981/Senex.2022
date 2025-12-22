<?php

namespace App\Http\Controllers\Admin\Agreements;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgreementRequest;
use App\Models\Agreement;
use App\Models\Insurance;
use App\Models\Patient;
use App\Models\PatientInsurance;
use App\Models\Plan;
use App\Models\SessionType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AgreementController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        // 1. Cargamos Agreements (El trait hace el where company_id)
        $agreements = Agreement::with('insurance', 'items', 'items.plan')->get();

        // 2. Cargamos SessionTypes (El trait hace el where company_id si aplica)
        $sessionTypes = SessionType::get(['id', 'name', 'base_price_clp']);

        // 3. Cargamos Aseguradoras (El trait hace el where company_id)
        $insurances = Insurance::get(['id', 'name']);

        // 4. 💡 CÓDIGO CRUCIAL: Cargamos todos los Planes asociados a esas Aseguradoras
        // (El trait hará el where company_id para Plan automáticamente)
        $plans = Plan::whereIn('insurance_id', $insurances->pluck('id'))
            ->get(['id', 'name', 'insurance_id', 'code']);

        return Inertia::render('Agreements/Index', [
            'agreements' => $agreements,
            'insurances' => $insurances,
            'sessionTypes' => $sessionTypes,
            'plans' => $plans
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAgreementRequest $request)
    {
        // Los datos ya están validados, y company_id ya está inyectado.
        $validated = $request->validated();

        // Si el convenio se crea como activo, desactivamos cualquier otro convenio previo para esa aseguradora
        if ($validated['is_active']) {
            // Desactivar otros convenios activos de la misma aseguradora y compañía
            Agreement::where('company_id', $validated['company_id'])
                ->where('insurance_id', $validated['insurance_id'])
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        try {
            DB::beginTransaction();

            $agreement = Agreement::create($validated);

            if (!$agreement) {
                DB::rollBack();
                session()->flash('message', "⚠️ No se ha podido crear el convenio tarifario.");
                session()->flash('type', 'error');
                return back();
            }

            DB::commit();
            session()->flash('message', "✅ Convenio '{$agreement->name}' creado exitosamente.");
            session()->flash('type', 'success');

            // 💡 Redirigir a la página de edición de reglas (AgreementItemEditor)
            return redirect()->route('agreements.edit', $agreement);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error("Error al almacenar Agreement: " . $th->getMessage(), ['trace' => $th->getTraceAsString()]);
            session()->flash('message', "⚠️ Error del sistema al crear el convenio tarifario.");
            session()->flash('type', 'error');
            return back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
