<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $type = $this->input('type');
        $currentCompanyId = session('current_company_id');

        if (! $this->has('company_id') && $currentCompanyId) {
            $this->merge(['company_id' => $currentCompanyId]);
        }
        
        if (!$this->has('is_family')) {
            $this->merge(['is_family' => false]);
        }
        
        // Limpiar campos que no aplican según el tipo de plan
        if ($type === 'internal') {
            $this->merge([
                'coverage_percentage' => 0,
                'insurance_id' => null, 
            ]); 
        } elseif ($type === 'external') {
            $this->merge([
                'price' => 0,
                'valid_months' => null,
                'content' => null,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $planId = $this->route('plan'); 
        $type = $this->input('type');

        $rules = [
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:255', Rule::unique('plans', 'code')->ignore($planId)],
            'type' => 'required|in:internal,external',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ];

        if ($type === 'internal') {
            $rules = array_merge($rules, [
                'price' => 'required|integer|min:0',
                'valid_months' => 'nullable|integer|min:0',
                'content' => 'required|array|min:1',
                'content.*.session_type_id' => 'required|exists:items,id|distinct',
                'content.*.max_sessions' => 'required|integer|min:1',
            ]);
        }

        if ($type === 'external') {
            $rules = array_merge($rules, [
                'insurance_id' => 'required|exists:insurances,id',
                'coverage_percentage' => 'nullable|numeric|min:0|max:100',
            ]);
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del plan es obligatorio.',
            'code.required' => 'El código del plan es obligatorio.',
            'code.unique' => 'El código del plan ya existe.',
            'insurance_id.required' => 'Debe seleccionar una aseguradora.',
            'content.required' => 'Debe agregar al menos un servicio al pack.',
            'content.*.session_type_id.required' => 'Debe seleccionar un servicio válido.',
            'content.*.session_type_id.distinct' => 'Hay servicios duplicados en el pack.',
        ];
    }
}
