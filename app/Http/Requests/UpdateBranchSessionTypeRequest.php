<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchSessionTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Agrega lógica de roles aquí si es necesario (ej: solo admin)
    }

    public function rules(): array
    {
        return [
            // Nullable porque si envían null, significa "Usar valor por defecto"
            'custom_price_clp'        => ['nullable', 'integer', 'min:0'],
            'custom_duration_minutes' => ['nullable', 'integer', 'min:15'],
            'is_active_in_branch'     => ['required', 'boolean'],
            'custom_code'             => ['nullable', 'string', 'max:50'],
        ];
    }
}
