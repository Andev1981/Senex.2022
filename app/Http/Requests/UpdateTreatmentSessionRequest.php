<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTreatmentSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Ajustar según permisos necesarios
    }

    /**
     * Get the custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'techniques' => 'técnicas',
            'exercises' => 'ejercicios',
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
            'company_id' => 'sometimes|exists:companies,id',
            'treatment_id' => 'sometimes|exists:treatments,id',
            'room_id' => 'nullable|exists:rooms,id',
            'doctor_id' => 'sometimes|exists:doctors,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'item_id' => 'nullable|exists:items,id',
            /* 'branch_id' => 'nullable|exists:branches,id', */

            'month_session_number' => 'sometimes',
            'date' => 'sometimes|date',
            'time' => 'sometimes|date_format:H:i',
            'duration' => 'sometimes|integer|min:15|max:180',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled,not_show,confirmed',

            // --- NUEVOS CAMPOS SOAP ---
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'plan' => 'nullable|string',
            
            'pain_level' => 'nullable|integer|min:0|max:10',
            'session_pain_map' => 'nullable|array',
            'evaluation_data' => 'nullable|array',
            'activities_data' => 'nullable|array',
            'attachments' => 'nullable|array',

            'consumes_plan' => 'nullable|boolean',
            'cost_breakdown' => 'nullable|array',
            'meta' => 'nullable|array',

            // Evaluación del dolor
            'pain_before' => 'nullable|integer|min:0|max:10',
            'pain_after' => 'nullable|integer|min:0|max:10',
            'rom_flexion_before' => 'nullable|integer|min:0|max:180',
            'rom_flexion_after' => 'nullable|integer|min:0|max:180',
            'rom_abduction_before' => 'nullable|integer|min:0|max:180',
            'rom_abduction_after' => 'nullable|integer|min:0|max:180',
            'rom_rotation_before' => 'nullable|integer|min:0|max:180',
            'rom_rotation_after' => 'nullable|integer|min:0|max:180',

            // Arrays JSON
            'techniques' => 'nullable|array',
            'exercises' => 'nullable|array',

            // Notas
            'notes' => 'nullable|string',
            'homework' => 'nullable|string',
            'next_goals' => 'nullable|string',
            'cancellation_note' => 'nullable|string',

            // Montos
            'patient_amount_clp' => 'nullable|integer|min:0',
            'doctor_amount_clp' => 'nullable|integer|min:0',
            'clinic_amount_clp' => 'nullable|integer|min:0',
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
            'treatment_id.exists' => 'El tratamiento seleccionado no existe',
            'doctor_id.exists' => 'El kinesiólogo seleccionado no existe',
            'patient_id.exists' => 'El paciente seleccionado no existe',
            'month_session_number.integer' => 'El número de sesión del mes debe ser un número entero',
            'month_session_number.min' => 'El número de sesión del mes debe ser al menos 1',
            'date.date' => 'La fecha debe tener un formato válido',
            'time.date_format' => 'La hora debe tener el formato HH:MM',
            'duration.integer' => 'La duración debe ser un número entero',
            'duration.min' => 'La duración debe ser al menos 15 minutos',
            'duration.max' => 'La duración no puede exceder 180 minutos',
            'status.in' => 'El estado debe ser Programada, Completada,En Progreso, Cancelada o No Asistió',
            'pain_before.integer' => 'El dolor inicial debe ser un número entero',
            'pain_before.min' => 'El dolor inicial debe ser al menos 0',
            'pain_before.max' => 'El dolor inicial no puede exceder 10',
            'pain_after.integer' => 'El dolor final debe ser un número entero',
            'pain_after.min' => 'El dolor final debe ser al menos 0',
            'pain_after.max' => 'El dolor final no puede exceder 10',
            'rom_flexion.integer' => 'La flexión debe ser un número entero',
            'rom_flexion.min' => 'La flexión debe ser al menos 0 grados',
            'rom_flexion.max' => 'La flexión no puede exceder 180 grados',
            'rom_abduction.integer' => 'La abducción debe ser un número entero',
            'rom_abduction.min' => 'La abducción debe ser al menos 0 grados',
            'rom_abduction.max' => 'La abducción no puede exceder 180 grados',
            'rom_rotation.integer' => 'La rotación debe ser un número entero',
            'rom_rotation.min' => 'La rotación debe ser al menos 0 grados',
            'rom_rotation.max' => 'La rotación no puede exceder 180 grados',
            'techniques.array' => 'Las técnicas deben ser una lista válida',
            'exercises.array' => 'Los ejercicios deben ser una lista válida',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $session = $this->route('session');
            
            // Asegurar que tenemos el modelo resuelto
            if (!$session instanceof \App\Models\TreatmentSession && is_numeric($session)) {
                $session = \App\Models\TreatmentSession::find($session);
            }

            if (!$session) {
                return;
            }

            // 1. Validar que no se cambie el estado de una sesión completada
            $newStatus = $this->input('status');
            if ($session->status === \App\Enums\AppointmentStatusEnum::COMPLETED && $this->has('status') && $newStatus !== 'completed') {
                $validator->errors()->add('status', 'No se puede cambiar el estado de una sesión que ya ha sido completada.');
            }
            
            // 2. Si la sesión está completada, restringir edición de campos logísticos y CLÍNICOS (SOAP)
            if ($session->status === \App\Enums\AppointmentStatusEnum::COMPLETED || $session->status->value === 'completed') {
                $protectedFields = [
                    'treatment_id', 
                    'item_id', 
                    'patient_id', 
                    'doctor_id', 
                    'date', 
                    'time', 
                    'consumes_plan',
                    'subjective',
                    'objective',
                    'assessment',
                    'plan',
                    'pain_before',
                    'pain_after',
                    'techniques',
                    'exercises',
                ];

                $isSuperAdmin = $this->user()->hasRole('superadmin');

                foreach ($protectedFields as $field) {
                    if ($this->has($field)) {
                        $newValue = $this->input($field);
                        $oldValue = $session->{$field};

                        // Comparación especial para arrays (techniques, exercises)
                        if (is_array($newValue) && is_array($oldValue)) {
                            if (json_encode($newValue) === json_encode($oldValue)) continue;
                        } elseif ($newValue == $oldValue) {
                            continue;
                        }

                        // Permitir a superadmin cambiar logística, pero NADIE cambia lo clínico (SOAP)
                        $isClinicalField = in_array($field, ['subjective', 'objective', 'assessment', 'plan', 'pain_before', 'pain_after', 'techniques', 'exercises']);
                        
                        if ($isClinicalField || !$isSuperAdmin) {
                            $validator->errors()->add($field, "No se puede modificar '{$field}' en una sesión ya completada (Protocolo de Persistencia SOAP).");
                        }
                    }
                }
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Limpieza de datos si es necesario
    }
}
