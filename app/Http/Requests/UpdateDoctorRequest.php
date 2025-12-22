<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
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
        $doctorId = $this->route('doctor')->id;

        return [

            // Doctor
            'name'              => ['required', 'string', 'max:255'],
            'last_name'         => ['required', 'string', 'max:255'],
            'rut'               => [
                'required',
                'string',
                'max:30',
                Rule::unique('doctors', 'rut')->ignore($doctorId)
            ],
            'email'             => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('doctors', 'email')->ignore($doctorId)
            ],
            'phone'             => ['nullable', 'string', 'max:30'],
            'speciality'        => ['nullable', 'string', 'max:255'],

            'birth_date'        => ['required', 'date', 'before:today'],
            'gender'            => ['nullable', 'string', 'max:10'],

            'status'            => ['nullable', 'string', 'max:50'],
            'mobile_app_access' => ['nullable', 'boolean'],
            'status_reason'     => ['nullable', 'string', 'max:255'],
            'status_changed_at' => ['nullable', 'date'],

            // Dirección
            'street'            => ['nullable', 'string', 'max:255'],
            'number'            => ['nullable', 'string', 'max:50'],
            'details'           => ['nullable', 'string', 'max:500'],

            'region_id'         => ['required', 'integer', 'exists:regions,id'],
            'province_id'       => ['required', 'integer', 'exists:provinces,id'],
            'commune_id'        => ['required', 'integer', 'exists:communes,id'],
        ];
    }

     public function messages(): array
    {
        return [
            // Datos del paciente
            'name.required'              => 'El nombre es obligatorio.',
            'last_name.required'         => 'El apellido es obligatorio.',

            'rut.required'               => 'El RUT es obligatorio.',
            'rut.unique'                 => 'El RUT ya está en uso.',

            'email.required'             => 'El correo electrónico es obligatorio.',
            'email.email'                => 'El correo electrónico no es válido.',
            'email.unique'               => 'El correo electrónico ya está en uso.',

            'phone.string'               => 'El teléfono debe ser una cadena de texto.',
            'phone.max'                  => 'El teléfono no debe exceder los 30 caracteres.',

            'speciality.string'          => 'La especialidad debe ser una cadena de texto.',
            'speciality.max'             => 'La especialidad no debe exceder los 255 caracteres.',

            'birth_date.required'        => 'La fecha de nacimiento es obligatoria.',
            'birth_date.date'            => 'La fecha de nacimiento no es válida.',
            'birth_date.before'          => 'La fecha de nacimiento debe ser anterior al día de hoy.',

            'gender.string'              => 'El género debe ser una cadena de texto.',
            'gender.max'                 => 'El género no debe exceder los 10 caracteres.',

            'status.string'              => 'El estado debe ser una cadena de texto.',
            'status.max'                 => 'El estado no debe exceder los 50 caracteres.',

            'status_reason.string'       => 'La razón del estado debe ser una cadena de texto.',
            'status_reason.max'          => 'La razón del estado no debe exceder los 255 caracteres.',

            'mobile_app_access.boolean'  => 'El estado de acceso debe ser verdadero o falso',

            'status_changed_at.date'     => 'La fecha de cambio de estado no es válida.',

            // Dirección
            'street.string'              => 'La calle debe ser una cadena de texto.',
            'street.max'                 => 'La calle no debe exceder los 255 caracteres.',

            'number.string'              => 'El número debe ser una cadena de texto.',
            'number.max'                 => 'El número no debe exceder los 50 caracteres.',

            'details.string'             => 'Los detalles deben ser una cadena de texto.',
            'details.max'                => 'Los detalles no deben exceder los 500 caracteres.',

            'region_id.required'         => 'La región es obligatoria.',
            'region_id.integer'          => 'La región seleccionada no es válida.',
            'region_id.exists'           => 'La región seleccionada no existe.',

            'province_id.required'       => 'La provincia es obligatoria.',
            'province_id.integer'        => 'La provincia seleccionada no es válida.',
            'province_id.exists'         => 'La provincia seleccionada no existe.',

            'commune_id.required'        => 'La comuna es obligatoria.',
            'commune_id.integer'         => 'La comuna seleccionada no es válida.',
            'commune_id.exists'          => 'La comuna seleccionada no existe.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'              => 'nombre',
            'last_name'         => 'apellido',
            'rut'               => 'RUT',
            'email'             => 'correo electrónico',
            'phone'             => 'teléfono',
            'speciality'        => 'especialidad',
            'birth_date'        => 'fecha de nacimiento',
            'gender'            => 'género',
            'status'            => 'estado',
            'status_reason'     => 'razón del estado',
            'status_changed_at' => 'fecha de cambio de estado',
            'mobile_app_access' => 'mobile_app_access',
            'street'            => 'calle',
            'number'            => 'número',
            'details'           => 'detalles',
            'region_id'         => 'región',
            'province_id'       => 'provincia',
            'commune_id'        => 'comuna',
        ];
    }
}
