<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // 1. Convertir is_active a booleano real
        if ($this->has('is_active')) {
            $this->merge(['is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        $rules = [
            'insurance_id' => ['required', 'integer', 'exists:insurances,id'],
            'name'         => ['required', 'string', 'max:255'],
            'version'      => ['nullable', 'string', 'max:50'],
            'start_date'   => ['required', 'date'],
            'is_active'    => ['required', 'boolean'],
        ];

        // LOGICA DE UNICIDAD CONDICIONAL:
        // Solo verificamos duplicados si el usuario está intentando crear un convenio ACTIVO.
        // Si is_active es false, permitimos crear el registro sin comprobar duplicados.
        if ($this->boolean('is_active')) {
            $rules['insurance_id'][] = Rule::unique('agreements', 'insurance_id')
                ->where(function ($query) {
                    return $query->where('company_id', $this->input('company_id'))
                        ->where('is_active', true);
                });
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'insurance_id.unique' => 'Ya existe un convenio activo para esta aseguradora en tu empresa.',
        ];
    }
}
