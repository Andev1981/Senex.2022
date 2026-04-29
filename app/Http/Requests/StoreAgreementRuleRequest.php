<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgreementRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepara los datos para la validación (Convierte '' a NULL).
     */
    protected function prepareForValidation()
    {
        // Si plan_id llega como cadena vacía (del selector de React), lo convertimos a NULL.
        if ($this->has('plan_id') && $this->input('plan_id') === '') {
            $this->merge(['plan_id' => null]);
        }
    }

    /**
     * Define las reglas de validación.
     */
    public function rules(): array
    {
        // Obtener el ID del AgreementRule si estamos editando (Update)
        $agreementRuleId = $this->route('agreement_rule') ? $this->route('agreement_rule')->id : null;

        // El plan_id se obtiene del input (puede ser NULL si fue convertido)
        $planId = $this->input('plan_id');

        return [
            // Identificadores
            'agreement_id' => 'required|exists:agreements,id',
            'item_id' => [
                'required',
                'exists:items,id',
                // 💡 REGLA DE UNICIDAD: item_id debe ser único DENTRO del plan_id (incluyendo NULL)
                Rule::unique('agreement_rules')->where(function ($query) use ($planId) {
                    // Si plan_id es null, buscamos donde plan_id también es null.
                    if (is_null($planId)) {
                        return $query->whereNull('plan_id');
                    }
                    // Si plan_id tiene valor, buscamos por ese valor.
                    return $query->where('plan_id', $planId);
                })->ignore($agreementRuleId),
            ],
            // El plan_id es opcional (nullable)
            'plan_id' => 'nullable|exists:plans,id',

            // Montos (Todos son requeridos, y el copago no puede ser mayor al bruto)
            'gross_price_clp' => 'required|integer|min:0',
            'patient_share_clp' => 'required|integer|min:0|lte:gross_price_clp',
            'insurance_share_clp' => 'required|integer|min:0',

            // Porcentajes (Calculados en el frontend, se validan aquí)
            'patient_percentage' => 'required|integer|min:0|max:100',
            'insurance_percentage' => 'required|integer|min:0|max:100',

            // Vigencia y Notas
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string|max:1000',

            // **IMPORTANTE: Si manejas límites de sesión:**
            // 'max_sessions' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Define mensajes personalizados.
     */
    public function messages(): array
    {
        return [
            'item_id.unique' => 'Ya existe una regla para este servicio dentro de este plan (o como regla general). Edite la existente.',
            'patient_share_clp.lte' => 'El copago del paciente no puede ser mayor al precio bruto total.',
            'start_date.required' => 'La fecha de inicio de vigencia es obligatoria.',
            'end_date.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
        ];
    }
}
