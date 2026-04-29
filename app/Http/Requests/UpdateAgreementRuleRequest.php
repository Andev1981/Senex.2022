<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\AgreementRule; // 1. Importante importar el modelo

class UpdateAgreementRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('plan_id') && $this->input('plan_id') === '') {
            $this->merge(['plan_id' => null]);
        }
    }

    public function rules(): array
    {
        // 2. RECUPERACIÓN SEGURA DEL MODELO
        // Obtenemos el parámetro de la ruta. Puede ser el Objeto (si el controller está bien) o un String ID (si no).
        $ruleParam = $this->route('rule');

        // Si es un ID (string/int), buscamos el modelo manualmente para evitar el error "property on string"
        if (!is_object($ruleParam)) {
            $ruleModel = AgreementRule::find($ruleParam);
            // Si no existe (alguien manipuló la URL), lanzamos error 404
            if (!$ruleModel) {
                abort(404, 'Regla no encontrada.');
            }
        } else {
            // Si ya es objeto, lo usamos directo
            $ruleModel = $ruleParam;
        }

        // 3. DEFINICIÓN DE VARIABLES PARA EL UNIQUE
        $planId = $this->input('plan_id');

        // AQUÍ ESTABA EL ERROR:
        // Usamos el segundo parámetro de input() como "valor por defecto".
        // Si 'agreement_id' no viene en el request, usamos el de la base de datos ($ruleModel->agreement_id).
        $agreementId = $this->input('agreement_id', $ruleModel->agreement_id);

        return [
            'agreement_id' => ['sometimes', 'required', 'exists:agreements,id'],

            'item_id' => [
                'required',
                'exists:items,id',

                // Validación de Unicidad
                Rule::unique('agreement_rules')
                    ->where(function ($query) use ($planId, $agreementId) {
                        // Ahora $agreementId NUNCA será null (a menos que el dato en BD esté corrupto)
                        $query->where('agreement_id', $agreementId);

                        if (is_null($planId)) {
                            $query->whereNull('plan_id');
                        } else {
                            $query->where('plan_id', $planId);
                        }
                    })
                    ->ignore($ruleModel->id), // Usamos el ID seguro del modelo recuperado
            ],

            'plan_id' => ['nullable', 'exists:plans,id'],

            'gross_price_clp'          => ['required', 'integer', 'min:0'],
            'patient_share_clp'    => ['required', 'integer', 'min:0', 'lte:gross_price_clp'],
            'insurance_share_clp'  => ['required', 'integer', 'min:0'],

            'patient_percentage'   => ['required', 'integer', 'min:0', 'max:100'],
            'insurance_percentage' => ['required', 'integer', 'min:0', 'max:100'],

            'start_date' => ['required', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            'notes'      => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'item_id.unique'    => 'Ya existe una regla configurada para este tipo de sesión y plan en este convenio.',
            'patient_share_clp.lte'     => 'El copago del paciente no puede ser mayor que el precio bruto.',
            'end_date.after_or_equal'   => 'La fecha de término no puede ser anterior a la de inicio.',
        ];
    }
}
