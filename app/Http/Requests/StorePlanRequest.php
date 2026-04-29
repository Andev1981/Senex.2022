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
        // 1. Obtener el ID de la empresa del usuario autenticado
         $currentCompanyId = session('current_company_id');

        // 2. Usar merge() para agregar 'company_id' si no existe en la solicitud
        // La lógica $validated['company_id'] = $currentCompanyId; se traduce a:
        
        if (! $this->has('company_id') && $currentCompanyId) {
            $this->merge([
                'company_id' => $currentCompanyId,
            ]);
        }
        
        // 2. Asegurar que is_family es un booleano (para cuando el checkbox no se envía)
        if (!$this->has('is_family')) {
            $this->merge(['is_family' => false]);
        }
        
        // 3. Limpiar campos que no aplican según el tipo de plan
        if ($type === 'internal') {
            // Un plan interno NO tiene porcentaje de cobertura base
            $this->merge(['coverage_percentage' => 0]); 
        } elseif ($type === 'external') {
            // Un plan externo NO tiene precio, meses de validez o contenido de paquete
            $this->merge([
                'price' => 0,
                'valid_months' => 0,
                'content' => null,
            ]);
        }
        
        // 4. Eliminar el campo obsoleto (total_sessions)
        if ($this->has('total_sessions')) {
             $this->offsetUnset('total_sessions');
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        // Obtener el ID del plan si estamos en una edición (Update)
        // Se asume que el Route Model Binding es 'plan'
        $planId = $this->route('plan'); 
        $type = $this->input('type');

        $rules = [
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            // 💡 AJUSTE: Permite que el código no sea único si es el plan que se está editando
            'code' => ['required', 'string', 'max:255', Rule::unique('plans', 'code')->ignore($planId)],
            'insurance_id' => 'required|exists:insurances,id',
            'coverage_percentage' => 'required|numeric',
            'total_sessions' => 'nullable|integer|min:0',
            'type' => 'required|in:internal,external',
            'price' => 'required|integer|min:0',
            'valid_months' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'content' => 'nullable|array'
        ];
        // Reglas Específicas para Planes Internos (Paquetes)
        if ($type === 'internal') {
            $rules = array_merge($rules, [
                // Estos campos son requeridos para un paquete interno
                'price' => 'required|integer|min:0',
                'valid_months' => 'nullable|integer|min:0',
                
                // Validación del contenido del paquete (Debe tener al menos un servicio)
                'content' => 'required|array|min:1',
                
                // Validación de cada item del contenido: ID, Sesiones
                'content.*.session_type_id' => [
                    'required', 
                    'exists:items,id',
                    'distinct', // 💡 CRÍTICO: Asegura que no se repitan servicios en el mismo paquete
                ],
                'content.*.max_sessions' => 'required|integer|min:1',
                
                // El porcentaje de cobertura debe ser cero (impuesto en prepareForValidation)
                'coverage_percentage' => 'numeric|in:0', 
            ]);
        }

        // Reglas Específicas para Planes Externos (Aseguradoras)
        if ($type === 'external') {
            $rules = array_merge($rules, [
                // Este campo es requerido para una cobertura externa
                'coverage_percentage' => 'required|numeric|min:0|max:100',
                
                // Estos campos deben ser cero/null (impuesto en prepareForValidation)
                'price' => 'integer|in:0', 
                'valid_months' => 'integer|in:0', 
                'content' => 'nullable', // Ya es null en prepareForValidation
            ]);
        }

        return $rules;
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
            'type.required' => 'Debe seleccionar el tipo de plan (Interno, Externo).',
            'type.in' => 'El tipo de plan seleccionado no es válido.',

            // ===== NUEVOS MENSAJES CONDICIONALES =====
            
            'content.required' => 'Debe agregar al menos un servicio al paquete interno.',
            'content.array' => 'El contenido del plan debe ser un listado de servicios.',
            'content.*.item_id.required' => 'El servicio del item :attribute es obligatorio.',
            'content.*.item_id.distinct' => 'Hay servicios duplicados en el paquete. Cada servicio debe ser único.',
            'content.*.item_id.exists' => 'El servicio seleccionado no es válido.',
            'content.*.max_sessions.required' => 'La cantidad de sesiones del item :attribute es obligatoria.',
            'content.*.max_sessions.min' => 'La cantidad de sesiones debe ser al menos 1.',
            
            'is_family.required' => 'El estado "Aplica a Grupo Familiar" es obligatorio.',
            'is_family.boolean' => 'El estado "Aplica a Grupo Familiar" no es válido.',
        ];
    }
}
