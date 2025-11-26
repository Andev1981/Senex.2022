<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTreatmentRequest extends FormRequest
{
   /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Ajustar según permisos necesarios
    }
    

    public function attributes(): array
    {
        return [
            'objectives' => 'objetivos',
        ];
    }
    
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {

        return [
            'session_type_id' => 'sometimes|exists:session_types,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:doctors,id',
            'diagnosis' => 'sometimes|string',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'status' => 'nullable|in:evaluation,in_progress,cancelled,paused,completed',
            'total_sessions' => 'nullable|integer|min:1|max:50',
            'completed_sessions' => 'nullable|integer|min:0|max:50',
            'frequency' => 'nullable|integer|min:0|max:7',
            'frequency_time' => 'nullable|in:day,week,month',
            'is_indefinite' => 'nullable|boolean',
            'current_phase' => 'nullable|string|max:100',
            'objectives' => 'nullable|array',
            'outcome' => 'nullable|string',
            'next_appointment' => 'nullable|date',
            // KPIs
            'pain_reduction' => 'nullable|integer|min:0|max:100',
            'mobility_improvement' => 'nullable|integer|min:0|max:100',
            'strength_gain' => 'nullable|integer|min:0|max:100',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'session_type_id.exists' => 'El tipo de sesión seleccionado no existe',
            'patient_id.exists' => 'El paciente seleccionado no existe',
            'doctor_id.exists' => 'El kinesiólogo seleccionado no existe',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio',
            'total_sessions.integer' => 'El total de sesiones debe ser un número entero',
            'total_sessions.min' => 'El total de sesiones debe ser al menos 1',
            'total_sessions.max' => 'El total de sesiones no puede exceder 50',
            'completed_sessions.integer' => 'Las sesiones completadas deben ser un número entero',
            'completed_sessions.min' => 'Las sesiones completadas no pueden ser negativas',
            'completed_sessions.max' => 'Las sesiones completadas no pueden exceder el total',
            'frequency.integer' => 'La frecuencia debe ser un número entero',
            'frequency.min' => 'La frecuencia debe ser al menos 0',
            'frequency.max' => 'La frecuencia no puede exceder 7',
            'frequency_time.in' => 'La unidad de tiempo debe ser día, semana o mes',
            'is_indefinite.boolean' => 'El campo indefinido debe ser verdadero o falso',
            'pain_reduction.integer' => 'La reducción de dolor debe ser un número entero',
            'pain_reduction.min' => 'La reducción de dolor debe ser al menos 0%',
            'pain_reduction.max' => 'La reducción de dolor no puede exceder 100%',
            'mobility_improvement.integer' => 'La mejora de movilidad debe ser un número entero',
            'mobility_improvement.min' => 'La mejora de movilidad debe ser al menos 0%',
            'mobility_improvement.max' => 'La mejora de movilidad no puede exceder 100%',
            'strength_gain.integer' => 'La ganancia de fuerza debe ser un número entero',
            'strength_gain.min' => 'La ganancia de fuerza debe ser al menos 0%',
            'strength_gain.max' => 'La ganancia de fuerza no puede exceder 100%',
            'objectives.array' => 'Los Objetivos deben ser un Arreglo válido',
            'status.in' => 'El estado seleccionado no es válido',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Combinar objetivos de array a JSON si viene como array
        if ($this->has('objectives')) {
            // Convertir objectives de string a array si es necesario
            $objectives = $this->objectives;
            
            if (is_string($objectives)) {
                // Si viene como string separado por comas, convertir a array
                $objectivesArray = array_filter(
                    array_map('trim', explode(',', $objectives)),
                    function($value) { return !empty($value); }
                );
                $this->merge(['objectives' => array_values($objectivesArray)]);
            }
        }

        // Validación personalizada: completed_sessions no puede ser mayor que total_sessions
        $this->validate([
            'completed_sessions' => [
                'nullable',
                'integer',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->has('total_sessions') && $value > $this->total_sessions) {
                        $fail('Las sesiones completadas no pueden ser mayores que el total de sesiones.');
                    }
                }
            ],
        ]);
    }
}
