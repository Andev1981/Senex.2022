<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgreementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // 💡 Inyectar el company_id del usuario actual si no fue enviado
        if (!$this->has('company_id') && $this->user() && $this->user()->company_id) {
            $this->merge([
                'company_id' => $this->user()->company_id,
            ]);
        }
        // Aseguramos que 'is_active' sea booleano
        if ($this->has('is_active')) {
            $this->merge(['is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        // Validamos la unicidad: no puede haber dos convenios activos para la misma aseguradora/compañía
        $uniqueRule = 'unique:agreements,insurance_id,' . ($this->agreement->id ?? 'NULL') . ',id,company_id,' . $this->input('company_id') . ',is_active,1';

        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'insurance_id' => ['required', 'integer', 'exists:insurances,id', $uniqueRule],
            'name' => ['required', 'string', 'max:255'],
            'version' => ['nullable', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
