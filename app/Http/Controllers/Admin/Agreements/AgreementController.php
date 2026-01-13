<?php

namespace App\Http\Controllers\Admin\Agreements;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgreementRequest;
use App\Http\Requests\UpdateAgreementRequest;
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
        $currentCompanyId = session('current_company_id');

        // 1. Cargamos Agreements filtrando por la compañía actual
        $agreements = Agreement::where('company_id', $currentCompanyId)
            ->with('insurance', 'rules', 'rules.plan', 'rules.sessionType')
            ->get();

        // 2. Cargamos SessionTypes (El trait hace el where company_id si aplica)
        $sessionTypes = SessionType::get(['id', 'name', 'base_price_clp']);

        // 3. Cargamos Aseguradoras (El trait hace el where company_id)
        $insurances = Insurance::get(['id', 'name']);

        // 4. 💡 CÓDIGO CRUCIAL: Cargamos todos los Planes asociados a esas Aseguradoras
        // (El trait hará el where company_id para Plan automáticamente)
        $plans = Plan::whereIn('insurance_id', $insurances->pluck('id'))
            ->get(['id', 'name', 'insurance_id', 'code']);

        return Inertia::render('agreements/Index', [
            'agreements' => $agreements,
            'insurances' => $insurances,
            'sessionTypes' => $sessionTypes,
            'plans' => $plans,
            'user' => auth()->user()->load('roles'),
        ]);
    }
    public function create()
    {
        // 1. Cargamos Aseguradoras (El trait hace el where company_id)
        $insurances = Insurance::get(['id', 'name']);

        return Inertia::render('agreements/Create', [
            'insurances' => $insurances
        ]);
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

            // 💡 Redirigir a la página de edición de reglas (AgreementRuleEditor)
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error("Error al almacenar Agreement: " . $th->getMessage(), ['trace' => $th->getTraceAsString()]);
            session()->flash('message', "⚠️ Error del sistema al crear el convenio tarifario.");
            session()->flash('type', 'error');
            return back();
        }
    }

    public function show(Agreement $agreement)
    {
        //
    }

    public function edit(Agreement $agreement)
    {
        // Cargar relaciones necesarias
        $agreement->load('insurance', 'rules', 'rules.plan', 'rules.sessionType');

        // Cargamos SessionTypes (El trait hace el where company_id si aplica)
        $sessionTypes = SessionType::get(['id', 'name', 'base_price_clp']);

        // Cargamos Aseguradoras (El trait hace el where company_id)
        $insurances = Insurance::get(['id', 'name']);

        // 💡 CÓDIGO CRUCIAL: Cargamos todos los Planes asociados a esa Aseguradora
        // (El trait hará el where company_id para Plan automáticamente)
        $plans = Plan::where('insurance_id', $agreement->insurance_id)
            ->get(['id', 'name', 'insurance_id', 'code']);

        return Inertia::render('agreements/Edit', [
            'agreement' => $agreement,
            'insurances' => $insurances,
            'sessionTypes' => $sessionTypes,
            'plans' => $plans
        ]);
    }


    /**
     * Show the form for updating the specified resource.
     */
    public function update(UpdateAgreementRequest $request, Agreement $agreement)
    {
        // Los datos ya están validados, y company_id ya está inyectado.
        $validated = $request->validated();


        try {
            DB::beginTransaction();

            $agreement = $agreement->update($validated);

            if (!$agreement) {
                DB::rollBack();
                session()->flash('message', "⚠️ No se ha podido crear el convenio tarifario.");
                session()->flash('type', 'error');
                return back();
            }

            DB::commit();
            session()->flash('message', "✅ Convenio '{$agreement["name"]}' creado exitosamente.");
            session()->flash('type', 'success');

            // 💡 Redirigir a la página de edición de reglas (AgreementEditor)
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
