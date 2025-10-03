<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
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
     * @return array
     */
    public function rules()
    {

        $id = $this->route('patient')->id;

        return [
            // Identidad
            'name'       => ['bail', 'required', 'string', 'max:120'],
            'last_name'  => ['bail', 'required', 'string', 'max:120'],

            // RUT: opcional, formato normalizado y único
            'rut'        => [
                'required',
                Rule::unique('patients', 'rut')->ignore($id),
            ],

            // Contacto
            'email'      => ['nullable', 'string', 'email', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:50'],

            // Demográficos
            'birth_date' => ['nullable', 'date', 'before_or_equal:today', 'after:1900-01-01'],
            'gender'     => ['nullable', Rule::in(['male', 'female', 'other', 'unknown'])],
            'occupation' => ['nullable', 'string', 'max:120'],
            'marital_status' => ['nullable', 'string', 'max:50'], // o usa Rule::in([...]) si tienes catálogo

            // Estado
            'status'         => ['required', Rule::in(['active', 'suspended', 'cancelled'])],
            'status_reason'  => ['nullable', 'string', 'max:2000', 'required_if:status,suspended,cancelled'],

            // Otros
            'notes'      => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages()
    {
        return [
            'name.required'          => 'El nombre es obligatorio.',
            'last_name.required'     => 'El apellido es obligatorio.',
            'rut.required'             => 'El RUT es requerido.',
            'rut.unique'             => 'Este RUT ya está registrado.',
            'email.email'            => 'El email no es válido.',
            'phone.regex'            => 'El teléfono debe estar en formato +56 seguido de 9–10 dígitos.',
            'birth_date.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'birth_date.after'       => 'La fecha de nacimiento debe ser posterior a 1900-01-01.',
            'gender.in'              => 'El género seleccionado no es válido.',
            'status.in'              => 'El estado seleccionado no es válido.',
            'status_reason.required_if' => 'Debes indicar el motivo cuando el estado es Suspendido o Cancelado.',
        ];
    }
}
