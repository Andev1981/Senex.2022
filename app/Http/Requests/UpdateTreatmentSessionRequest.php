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
            'session_type_id' => 'nullable|exists:session_types,id',
            /* 'branch_id' => 'nullable|exists:branches,id', */

            'month_session_number' => 'sometimes',
            'date' => 'sometimes|date',
            'time' => 'sometimes|date_format:H:i',
            'duration' => 'sometimes|integer|min:15|max:180',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled,not_attend',

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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Para sesiones completadas, asegurar que tengan evaluación de dolor
        if ($this->has('status') && $this->status === 'Completada') {
            $this->validate([
                'pain_before' => 'required|integer|min:0|max:10',
                'pain_after' => 'required|integer|min:0|max:10',
            ]);
        }

        // Validación personalizada: prevenir cambiar datos de una sesión completada
        $this->validate([
            'status' => [
                function ($attribute, $value, $fail) {
                    $session = $this->route('session');
                    if ($session && $session->status === 'Completada' && $value !== 'Completada') {
                        $fail('No se puede cambiar el estado de una sesión completada.');
                    }
                }
            ]
        ]);
    }
}
