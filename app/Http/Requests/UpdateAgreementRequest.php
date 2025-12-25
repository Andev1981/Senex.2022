<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // 1. Inyectar company_id si falta
        if (!$this->has('company_id') && $this->user() && $this->user()->company_id) {
            $this->merge([
                'company_id' => $this->user()->company_id,
            ]);
        }

        // 2. Convertir is_active a booleano real antes de validar
        if ($this->has('is_active')) {
            $this->merge(['is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        $agreement = $this->route('agreement');
        $agreementId = optional($agreement)->id;

        $rules = [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'insurance_id' => ['required', 'integer', 'exists:insurances,id'],
            'name' => ['required', 'string', 'max:255'],
            'version' => ['nullable', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
        ];

        // Solo validamos unicidad si el usuario está intentando activar este convenio
        if ($this->boolean('is_active')) {
            $rules['insurance_id'][] = Rule::unique('agreements', 'insurance_id')
                ->where('company_id', $this->input('company_id'))
                ->where('is_active', true) // Choca solo si hay otro activo
                ->ignore($agreementId);
        }

        return $rules;
    }
}
