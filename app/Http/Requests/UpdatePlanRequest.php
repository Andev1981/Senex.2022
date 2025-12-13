<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanRequest extends FormRequest
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

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:plans,code',
            'insurance_id' => 'required|exists:insurances,id',
            'coverage_percentage' => 'required|numeric',
            'total_sessions' => 'nullable|integer|min:0',
            'type' => 'required|in:annual,session_pack,unlimited',
            'price' => 'required|integer|min:0',
            'valid_months' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            // ===== REGLAS BÁSICAS DE REQUERIMIENTO =====
            'name.required' => 'El nombre del plan es obligatorio.',
            'code.required' => 'El código del plan es obligatorio.',
            'price.required' => 'El precio del plan es obligatorio.',
            
            // ===== REGLAS DE TIPO DE DATO Y FORMATO =====
            'name.string' => 'El nombre debe ser texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'code.string' => 'El código debe ser texto.',
            'code.max' => 'El código no puede exceder los 255 caracteres.',
            
            'coverage_percentage.required' => 'El porcentaje de cobertura es obligatorio.',
            'coverage_percentage.numeric' => 'El porcentaje de cobertura debe ser un número (ej: 70.5).',
            
            'total_sessions.integer' => 'El límite de sesiones debe ser un número entero.',
            'total_sessions.min' => 'El límite de sesiones no puede ser negativo.',
            
            'price.integer' => 'El precio debe ser un número entero (en pesos chilenos).',
            'price.min' => 'El precio no puede ser negativo.',
            
            'valid_months.integer' => 'Los meses de validez deben ser un número entero.',
            'valid_months.min' => 'Los meses de validez no pueden ser negativos.',
            
            'start_date.date' => 'La fecha de inicio no tiene un formato de fecha válido.',
            'end_date.date' => 'La fecha de término no tiene un formato de fecha válido.',
            
            'description.string' => 'La descripción debe ser texto.',
            'is_active.boolean' => 'El estado activo/inactivo debe ser booleano.',


            // ===== REGLAS DE UNICIDAD Y EXISTENCIA (CRÍTICAS) =====
            
            // La sintaxis correcta para 'unique' es: 'unique:tabla,columna,excepto_id'
            'code.unique' => 'El código del plan ya existe. Por favor, ingrese un código único.',
            
            // CORRECCIÓN: 'exists' en lugar de 'in:insurances,id'
            'insurance_id.required' => 'Debe seleccionar una aseguradora/entidad.',
            'insurance_id.exists' => 'La aseguradora seleccionada no es válida o no existe.',


            // ===== REGLAS DE VALORES PERMITIDOS (ENUM) =====
            
            // Corregido: 'in' se usa para validar que el valor esté dentro de la lista (ENUM)
            'type.required' => 'Debe seleccionar el tipo de plan (anual, paquete, ilimitado).',
            'type.in' => 'El tipo de plan seleccionado no es válido.',
        ];
    }
}
