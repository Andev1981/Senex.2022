<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = auth()->user()->company_id;
        $itemId = $this->route('service') ? $this->route('service')->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('items', 'name')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })->ignore($itemId)
            ],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('items', 'sku')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })->ignore($itemId)
            ],
            'category' => ['nullable', 'string', 'max:100'],
            'base_price_clp' => ['required', 'integer', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:300'],
            'default_doctor_commission_clp' => ['required', 'integer', 'min:0'],
            'requires_diagnosis' => ['required', 'boolean'],
            'requires_referral' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'is_exempt' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nombre del Servicio',
            'code' => 'Código',
            'category' => 'Especialidad',
            'base_price_clp' => 'Precio Base',
            'duration_minutes' => 'Duración (minutos)',
            'default_doctor_commission_clp' => 'Comisión Doctor',
            'requires_diagnosis' => 'Requiere Diagnóstico',
            'requires_referral' => 'Requiere Derivación',
            'is_active' => 'Estado Activo',
        ];
    }
}
