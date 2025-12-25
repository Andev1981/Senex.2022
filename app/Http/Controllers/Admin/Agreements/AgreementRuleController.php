<?php

namespace App\Http\Controllers\Admin\Agreements;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgreementRuleRequest;
use App\Http\Requests\UpdateAgreementRuleRequest;
use App\Models\AgreementRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AgreementRuleController extends Controller
{


    /**
     * Almacena un nuevo AgreementRule.
     */
    // 💡 Usamos el FormRequest para la validación
    public function store(StoreAgreementRuleRequest $request)
    {
        $validated = $request->validated();

        try {
            // Creamos el AgreementRule
            DB::beginTransaction();

            // Creamos el AgreementRule directamente con los datos validados
            $item = AgreementRule::create($validated);

            DB::commit();

            // Retornamos el item creado o un JSON simple para el modal
            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'success');
            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("AgreementRuleController falló store: " . $e->getMessage());
            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'error');
            // Esto debería ser capturado por el FormRequest o Inertia automáticamente
            return back();
        }
    }


    /**
     * Actualiza un AgreementRule existente.
     */
    public function update(UpdateAgreementRuleRequest $request, AgreementRule $rule)
    {
        // La validación y la conversión de plan_id a NULL si es '' ocurren en el FormRequest
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Actualizamos el rule
            $rule->update($validated);

            DB::commit();

            // Retornamos el item actualizado o un JSON simple
            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'success');
            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("AgreementRuleController falló update: " . $e->getMessage());
            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'error');
            return back();
        }
    }

    /**
     * Elimina un AgreementRule.
     */
    public function destroy(AgreementRule $agreementRule)
    {
        $planId = $agreementRule->plan_id;
        try {
            $agreementRule->delete();
            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'success');
            return back();
        } catch (\Exception $e) {
            Log::error("AgreementRuleController falló destroy: " . $e->getMessage());
            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'error');
            return back();
        }
    }
}
