<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;


class UpdateSessionTypeRequest extends FormRequest
{
     /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize(): bool
    {
        // Ajustar según tu lógica de permisos (ej: $this->user()->can('manage_services'))
        return true; 
    }

    /**
     * Define las reglas de validación que aplican a la petición.
     */
    public function rules(): array
    {
        // Obtener el ID del servicio actual para la exclusión en la regla 'unique'
        $sessionTypeId = $this->route('session_type') ? $this->route('session_type')->id : null;
        
        // Asumimos que el company_id del usuario autenticado es el company_id del registro
        $companyId = $this->user()->company_id; 

        return [
            // --- 1. Control Multi-Empresa ---
            'company_id' => [
                'required', 
                'integer', 
                'exists:companies,id'
            ],

            // --- 2. Identificación y Unicidad ---
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required', 
                'string', 
                'max:50',
                // Asegura la unicidad del código DENTRO de la empresa
                Rule::unique('session_types')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })->ignore($sessionTypeId), // Ignora el registro actual en el update
            ],
            'category' => ['nullable', 'string', 'max:100'],

            // --- 3. Precios y Tiempo ---
            'base_price_clp' => ['required', 'integer', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:300'],
            'plan_discount_clp' => [
                'nullable', 
                'integer', 
                'min:0', 
                'lte:base_price_clp' // Descuento no puede ser mayor que el precio base
            ],

            // --- 4. Requisitos y Estado ---
            'require_diagnosis' => ['required', 'boolean'],
            'require_referral' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }
    
    /**
     * Define los mensajes de error personalizados.
     */
    public function messages(): array
    {
        return [
            // Mensajes genéricos para 'required' y 'integer'
            'required' => 'El campo :attribute es obligatorio.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'max' => 'El campo :attribute no puede exceder :max caracteres.',
            'min' => 'El campo :attribute debe ser de al menos :min.',

            // Mensajes específicos
            'code.unique' => 'Ya existe un servicio con este código dentro de tu empresa.',
            'plan_discount_clp.lte' => 'El descuento no puede ser mayor al Precio Base.',
            'duration_minutes.max' => 'La duración máxima de una sesión es de 300 minutos (5 horas).',
            'company_id.exists' => 'La empresa seleccionada no es válida.',
        ];
    }
    
    /**
     * Define los nombres de atributos (para usar en los mensajes).
     */
    public function attributes(): array
    {
        return [
            'company_id' => 'Empresa',
            'name' => 'Nombre del Servicio',
            'code' => 'Código',
            'category' => 'Categoría',
            'base_price_clp' => 'Precio Base',
            'duration_minutes' => 'Duración (minutos)',
            'plan_discount_clp' => 'Descuento Base',
            'require_diagnosis' => 'Requiere Diagnóstico',
            'require_referral' => 'Requiere Derivación',
            'is_active' => 'Estado Activo',
        ];
    }
}
