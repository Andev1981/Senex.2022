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
            'name'        => ['required', 'string', 'max:255'],
            'last_name'   => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'max:255', Rule::unique('patients', 'email')->ignore($id)],
            'rut'         => ['required', 'string', 'max:30', Rule::unique('patients', 'rut')->ignore($id)],
            'birth_date'       => ['required', 'date'],
            'phone'       => ['nullable', 'string', 'max:30'],

            // Dirección
            'street'      => ['nullable', 'string', 'max:255'],
            'number'      => ['nullable', 'string', 'max:50'],
            'details'     => ['nullable', 'string', 'max:500'],
            'region_id'   => ['required', 'exists:regions,id'],
            'province_id' => ['required', 'exists:provinces,id'],
            'commune_id'  => ['required', 'exists:communes,id'],
        ];
    }

    public function messages()
    {
        return [
            'name.required'       => 'El nombre es obligatorio.',
            'last_name.required'  => 'El apellido es obligatorio.',
            'email.required'      => 'El correo electrónico es obligatorio.',
            'email.email'         => 'El correo electrónico no es válido.',
            'email.unique'        => 'El correo electrónico ya está en uso.',
            'rut.required'        => 'El RUT es obligatorio.',
            'rut.unique'          => 'El RUT ya está en uso.',
            'birth_date.required'      => 'La fecha de nacimiento es obligatoria.',
            'birth_date.date'          => 'La fecha de nacimiento no es válida.',
            'phone.string'        => 'El teléfono debe ser una cadena de texto.',
            'phone.max'           => 'El teléfono no debe exceder los 30 caracteres.',

            // Dirección
            'street.string'       => 'La calle debe ser una cadena de texto.',
            'street.max'          => 'La calle no debe exceder los 255 caracteres.',
            'number.string'       => 'El número debe ser una cadena de texto.',
            'number.max'          => 'El número no debe exceder los 50 caracteres.',
            'details.string'      => 'Los detalles deben ser una cadena de texto.',
            'details.max'         => 'Los detalles no deben exceder los 500 caracteres.',
            'region_id.required'  => 'La región es obligatoria.',
            'region_id.exists'    => 'La región seleccionada no es válida.',
            'province_id.required' => 'La provincia es obligatoria.',
            'province_id.exists'  => 'La provincia seleccionada no es válida.',
            'commune_id.required' => 'La comuna es obligatoria.',
            'commune_id.exists'   => 'La comuna seleccionada no es válida.',
        ];
    }
}
