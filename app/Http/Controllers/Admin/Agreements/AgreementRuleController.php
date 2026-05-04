<?php

namespace App\Http\Controllers\Admin\Agreements;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgreementRuleRequest;
use App\Http\Requests\UpdateAgreementRuleRequest;
use App\Models\AgreementRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AgreementRuleController extends Controller
{


    /**
     * Crea o actualiza una regla de convenio desde el tarifario integrado.
     */
    public function upsert(Request $request)
    {
        $validated = $request->validate([
            'agreement_id' => 'required|exists:agreements,id',
            'item_id' => 'required|exists:items,id',
            'plan_id' => 'nullable|exists:plans,id',
            'gross_price_clp' => 'required|integer|min:0',
            'patient_share_clp' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $insuranceShare = max(0, $validated['gross_price_clp'] - $validated['patient_share_clp']);
            
            // Determinar porcentajes para auditoría
            $patientPercentage = $validated['gross_price_clp'] > 0 
                ? round(($validated['patient_share_clp'] / $validated['gross_price_clp']) * 100, 2)
                : 0;

            $rule = AgreementRule::updateOrCreate(
                [
                    'agreement_id' => $validated['agreement_id'],
                    'item_id' => $validated['item_id'],
                    'plan_id' => $validated['plan_id'] ?: null,
                ],
                [
                    'gross_price_clp' => $validated['gross_price_clp'],
                    'patient_share_clp' => $validated['patient_share_clp'],
                    'insurance_share_clp' => $insuranceShare,
                    'patient_percentage' => $patientPercentage,
                    'insurance_percentage' => 100 - $patientPercentage,
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tarifa actualizada.',
                'rule' => $rule->load(['item', 'plan'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error en upsert de AgreementRule: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'No se pudo guardar la regla.'
            ], 500);
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
