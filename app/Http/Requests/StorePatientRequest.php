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

        // Verificar si la sucursal actual requiere atención a domicilio obligatoria
        $activeBranchId = session('active_branch_id');
        $isHomeCareOnly = false;
        if ($activeBranchId) {
            $isHomeCareOnly = \App\Models\Branch::where('id', $activeBranchId)
                ->where('is_home_care_only', true)
                ->exists();
        }

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

            // Dirección (Obligatoria si la sucursal es solo domicilio o si se marcó el switch)
            'is_home_care' => ['boolean'],
            'street'       => [$isHomeCareOnly ? 'required' : 'required_if:is_home_care,true', 'nullable', 'string', 'max:255'],
            'number'       => [$isHomeCareOnly ? 'required' : 'required_if:is_home_care,true', 'nullable', 'string', 'max:50'],
            'commune_id'   => [$isHomeCareOnly ? 'required' : 'required_if:is_home_care,true', 'nullable', 'exists:communes,id'],

            // Preferencias y Flags
            'opt_out_reminders' => ['boolean'],
            'prefers_whatsapp'  => ['boolean'],
            'prefers_mail'      => ['boolean'],
            'prefers_sms'       => ['boolean'],
            'require_tutor'     => ['boolean'],
            'send_welcome_notification' => ['boolean'],

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
            'name.required'             => 'El nombre del paciente es obligatorio.',
            'last_name.required'        => 'El apellido del paciente es obligatorio.',
            'rut.required'              => 'El RUT del paciente es obligatorio.',
            'rut.unique'                => 'Este RUT ya se encuentra registrado en el sistema.',
            'birth_date.required'       => 'La fecha de nacimiento es obligatoria.',
            'birth_date.before'         => 'La fecha de nacimiento debe ser anterior al día de hoy.',
            
            'email.unique'              => 'Este correo electrónico ya está registrado.',
            'email.required_if'         => 'El correo electrónico es obligatorio si el paciente es independiente (no tiene tutor).',
            'email.email'               => 'El formato del correo electrónico no es válido.',
            
            'phone.max'                 => 'El teléfono no puede tener más de 30 caracteres.',
            
            'require_tutor.boolean'     => 'El campo requiere tutor debe ser verdadero o falso.',
            
            // Mensajes Tutor
            'guardian_name.required_if'         => 'Debe ingresar el nombre completo del Tutor o Apoderado.',
            'guardian_relationship.required_if' => 'Debe indicar el parentesco o relación con el paciente.',
            'guardian_phone.required_if'        => 'El teléfono del tutor es obligatorio para coordinar notificaciones y cobros.',
            'guardian_email.required_if'        => 'El correo del tutor es obligatorio para el envío de documentos.',
            'guardian_rut.required_if'          => 'El RUT del tutor es obligatorio para la facturación.',

            // Mensajes Dirección
            'street.required'    => 'La calle es obligatoria para la atención a domicilio.',
            'number.required'    => 'El número de domicilio es obligatorio.',
            'commune_id.required' => 'La comuna es obligatoria para coordinar la visita.',
            'street.required_if' => 'Debe ingresar la calle para atención a domicilio.',
            'number.required_if' => 'Debe ingresar el número para atención a domicilio.',
            'commune_id.required_if' => 'Debe seleccionar la comuna para atención a domicilio.',
        ];
    }
}
