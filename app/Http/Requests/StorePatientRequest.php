<?php

namespace App\Http\Requests;

use App\Models\Patient;
use App\Models\PatientContact;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
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

        if ($this->has('guardian_rut')) {
            $this->merge([
                'guardian_rut' => \App\Rules\ValidRut::clean($this->guardian_rut),
            ]);
        }
    }

    public function rules(): array
    {
        // 🎯 Buscamos si el paciente existe para ignorarlo en la validación de Unique
        // Usamos el ID del request si viene (edición) o buscamos por RUT
        $patientId = $this->id;

        return [
            // Datos del paciente
            'name'      => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'rut'       => [
                'required',
                'string',
                'max:20',
                new \App\Rules\ValidRut,
                Rule::unique('patients', 'rut')
                    ->where('company_id', session('current_company_id'))
                    ->ignore($patientId)
            ],
            'email'     => [
                'required_if:require_tutor,false',
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('patients', 'email')
                    ->where('company_id', session('current_company_id'))
                    ->ignore($patientId)
            ],
            'phone'      => ['nullable', 'string', 'max:30'],
            'birth_date' => ['required', 'date', 'before:today'],

            // Preferencias y Flags
            'opt_out_reminders' => ['boolean'],
            'prefers_whatsapp'  => ['boolean'],
            'prefers_mail'      => ['boolean'],
            'prefers_sms'       => ['boolean'],
            'require_tutor'     => ['boolean'],

            // Datos del Tutor (Obligatorios solo si require_tutor es true)
            'guardian_name'         => ['required_if:require_tutor,true', 'nullable', 'string', 'max:255'],
            'guardian_relationship' => ['required_if:require_tutor,true', 'nullable', 'string', 'max:255'],
            'guardian_phone'        => ['required_if:require_tutor,true', 'nullable', 'string', 'max:30'],
            'guardian_email'        => ['required_if:require_tutor,true', 'nullable', 'email', 'max:255'],
            'guardian_rut'          => ['required_if:require_tutor,true', 'nullable', 'string', 'max:20'],

            // Otros campos
            'gender'         => ['nullable', 'string', 'max:10'],
            'occupation'     => ['nullable', 'string', 'max:255'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'status'         => ['nullable', 'string', 'max:50'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rut.unique'   => 'Este RUT ya se encuentra registrado en la empresa.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'email.required_if' => 'El correo es obligatorio cuando el paciente no tiene tutor.',
            'guardian_name.required_if'  => 'Debe ingresar el nombre del tutor.',
            'guardian_phone.required_if' => 'El teléfono del tutor es obligatorio para enviar notificaciones.',
            'guardian_email.required_if' => 'El correo del tutor es obligatorio.',
            'guardian_rut.required_if'   => 'El RUT del tutor es obligatorio.',
        ];
    }
}
