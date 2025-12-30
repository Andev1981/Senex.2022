<?php

namespace App\Http\Requests;

use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('rut')) {
            $this->merge([
                'rut' => \App\Rules\ValidRut::clean($this->rut),
            ]);
        }
    }

    public function rules(): array
    {
        $patient = $this->route('patient');

        return [
            // Paciente
            'name'              => ['required', 'string', 'max:255'],
            'last_name'         => ['required', 'string', 'max:255'],
            'rut' => [
                'required',
                'string',
                'max:20',
                new \App\Rules\ValidRut,
                Rule::unique('patients', 'rut')
                    ->where('company_id', session('current_company_id'))
                    ->ignore($patient->id),
            ],
            'email'             => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('patients', 'email')
                    ->where('company_id', session('current_company_id'))
                    ->ignore($patient->id)
            ],
            'phone'             => ['nullable', 'string', 'max:30'],

            'birth_date'        => ['required', 'date', 'before:today'],
            'gender'            => ['nullable', 'string', 'max:10'],
            'occupation'        => ['nullable', 'string', 'max:255'],
            'marital_status'    => ['nullable', 'string', 'max:50'],

            'status'            => ['nullable', 'string', 'max:50'],
            'status_reason'     => ['nullable', 'string', 'max:255'],
            'status_changed_at' => ['nullable', 'date'],

            'notes'             => ['nullable', 'string', 'max:1000'],

            // Dirección
            'street'            => ['nullable', 'string', 'max:255'],
            'number'            => ['nullable', 'string', 'max:50'],
            'details'           => ['nullable', 'string', 'max:500'],

            'region_id'         => ['nullable', 'integer', 'exists:regions,id'],
            'province_id'       => ['nullable', 'integer', 'exists:provinces,id'],
            'commune_id'        => ['nullable', 'integer', 'exists:communes,id'],
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
            'birth_date'        => 'fecha de nacimiento',
            'gender'            => 'género',
            'occupation'        => 'ocupación',
            'marital_status'    => 'estado civil',
            'status'            => 'estado',
            'status_reason'     => 'razón del estado',
            'status_changed_at' => 'fecha de cambio de estado',
            'notes'             => 'notas',
            'street'            => 'calle',
            'number'            => 'número',
            'details'           => 'detalles',
            'region_id'         => 'región',
            'province_id'       => 'provincia',
            'commune_id'        => 'comuna',
        ];
    }
}
