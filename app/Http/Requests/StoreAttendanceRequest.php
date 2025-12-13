<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
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
            'patient_id' => 'required|exists:patients,id',
            'consume_plan' => 'nullable|boolean',
            'patient_plan_id' => 'nullable|exists:patient_plans,id',
            'doctor_id' => 'required|exists:doctors,id',
            'session_type_id' => 'required|exists:session_types,id',
            'patient_amount_cl' => 'required|numeric|min:0',
            'date' => 'required|date',
            'time' => 'required',
            'duration' => 'required|integer|min:15',
            'status' => 'required|in:scheduled,completed',
        ];
    }

    public function messages(): array
{
    return [
        // ===== PACIENTE Y PLAN =====
        'patient_id.required' => 'Debe seleccionar un paciente para la sesión.',
        'patient_id.exists' => 'El paciente seleccionado no es válido o no existe.',
        
        'consume_plan.boolean' => 'El campo "consumir plan" debe ser verdadero o falso.',
        
        'patient_plan_id.exists' => 'El plan de paciente seleccionado no es válido o no existe.',

        // ===== PERSONAL Y SERVICIO =====
        'doctor_id.required' => 'Debe asignar un profesional (doctor/kinesiólogo) a la sesión.',
        'doctor_id.exists' => 'El profesional seleccionado no es válido o no existe.',
        
        'session_type_id.required' => 'Debe seleccionar un tipo de atención (ej: Kinesiología General).',
        'session_type_id.exists' => 'El tipo de atención seleccionado no es válido o no existe.',
        
        // ===== FECHA, HORA Y DURACIÓN =====
        'date.required' => 'La fecha de la sesión es obligatoria.',
        'date.date' => 'La fecha de la sesión no tiene un formato válido.',
        
        'time.required' => 'La hora de la sesión es obligatoria.',
        
        'duration.required' => 'La duración de la sesión es obligatoria.',
        'duration.integer' => 'La duración debe ser un número entero (en minutos).',
        'duration.min' => 'La duración mínima de la sesión debe ser de 15 minutos.',
        
        // ===== MONTOS Y ESTADO =====
        'patient_amount_cl.required' => 'El monto a pagar por el paciente es obligatorio.',
        'patient_amount_cl.numeric' => 'El monto a pagar debe ser un valor numérico.',
        'patient_amount_cl.min' => 'El monto a pagar por el paciente no puede ser negativo.',
        
        'status.required' => 'El estado de la sesión es obligatorio.',
        'status.in' => 'El estado de la sesión seleccionado no es válido. Solo se permite "Agendado" o "Completado".',
    ];
}
}
