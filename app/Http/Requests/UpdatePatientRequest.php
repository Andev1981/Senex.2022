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

        // Verificar si la sucursal actual requiere atención a domicilio obligatoria
        $activeBranchId = session('active_branch_id');
        $isHomeCareOnly = false;
        if ($activeBranchId) {
            $isHomeCareOnly = \App\Models\Branch::where('id', $activeBranchId)
                ->where('is_home_care_only', true)
                ->exists();
        }

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
            'street'            => [$isHomeCareOnly ? 'required' : 'nullable', 'string', 'max:255'],
            'number'            => [$isHomeCareOnly ? 'required' : 'nullable', 'string', 'max:50'],
            'details'           => ['nullable', 'string', 'max:500'],

            'region_id'         => ['nullable', 'integer', 'exists:regions,id'],
            'province_id'       => ['nullable', 'integer', 'exists:provinces,id'],
            'commune_id'        => [$isHomeCareOnly ? 'required' : 'nullable', 'integer', 'exists:communes,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'El nombre del paciente es obligatorio.',
            'last_name.required'        => 'El apellido del paciente es obligatorio.',
            'rut.required'              => 'El RUT del paciente es obligatorio.',
            'rut.unique'                => 'Este RUT ya está asociado a otro paciente en el sistema.',
            'birth_date.required'       => 'La fecha de nacimiento es obligatoria.',
            'birth_date.before'         => 'La fecha de nacimiento debe ser válida (anterior a hoy).',
            
            'email.unique'              => 'Este correo electrónico ya está en uso por otro paciente.',
            'email.email'               => 'El formato del correo electrónico no es válido.',
            
            'commune_id.exists'         => 'La comuna seleccionada no es válida.',
            'region_id.exists'          => 'La región seleccionada no es válida.',
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
