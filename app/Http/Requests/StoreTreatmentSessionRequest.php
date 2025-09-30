<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTreatmentSessionRequest extends FormRequest
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
            'patient_id' => ['required', 'max:255', 'exists:patients,id'],
            'doctor_id' => ['required', 'max:255', 'exists:doctors,id'],
            'session_type_id' => ['nullable', 'exists:session_types,id'],
            'planned_sessions' => ['nullable', 'numeric', 'max:100'],
            'is_indefinite' => ['nullable', 'boolean'],
            'evaluation_required' => ['nullable', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500']
        ];
    }

    public function messages()
    {
        return [
            'patient_id.required' => "Debe tener un paciente seleccionado",
        ];
    }
}
