<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgreementItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Mantenemos la preparación para limpiar el plan_id si viene vacío.
     */
    protected function prepareForValidation()
    {
        if ($this->has('plan_id') && $this->input('plan_id') === '') {
            $this->merge(['plan_id' => null]);
        }
    }

    public function rules(): array
    {
        /* dd($this->route()->parameters()); */
        // 1. Obtener el ID del registro que estamos actualizando desde la ruta.
        // Asumiendo que tu ruta es algo como: /agreement-items/{agreement_item}
        $item = $this->route('item');

        $idToIgnore = is_object($item) ? $item->id : $item;

        if (!$idToIgnore) {
            // Fallback de seguridad: Si no encontramos el ID, esto fallará visiblemente
            // para que sepas que la ruta está mal definida.
            abort(500, 'No se pudo identificar el ID del item para la validación unique.');
        }

        // 2. INPUTS
        $planId = $this->input('plan_id');
        $agreementId = $this->input('agreement_id'); // Asegúrate que este input venga en el formulario
        return [
            'agreement_id' => 'required|exists:agreements,id',

            'session_type_id' => [
                'required',
                'exists:session_types,id',

                // 3. REGLA UNIQUE REFINADA
                Rule::unique('agreement_items')
                    ->where(function ($query) use ($planId, $agreementId) {
                        // A. Debe ser dentro del mismo convenio
                        $query->where('agreement_id', $agreementId);

                        // B. Debe ser para el mismo plan (Manejando NULL explícitamente)
                        if (is_null($planId)) {
                            $query->whereNull('plan_id');
                        } else {
                            $query->where('plan_id', $planId);
                        }
                    })
                    ->ignore($idToIgnore), // <--- Aquí usamos el ID que capturamos arriba
            ],

            'plan_id' => 'nullable|exists:plans,id',

            // Validaciones numéricas (Mismas que en Store)
            'gross_price' => 'required|integer|min:0',
            // lte: less than or equal (menor o igual)
            'patient_share_clp' => 'required|integer|min:0|lte:gross_price',
            'insurance_share_clp' => 'required|integer|min:0',

            'patient_percentage' => 'required|integer|min:0|max:100',
            'insurance_percentage' => 'required|integer|min:0|max:100',

            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'session_type_id.unique' => 'Ya existe una regla idéntica (mismo servicio y plan) en este convenio.',
            'patient_share_clp.lte' => 'El copago del paciente no puede superar el precio bruto.',
            'end_date.after_or_equal' => 'La fecha de término debe ser posterior a la de inicio.',
        ];
    }
}
