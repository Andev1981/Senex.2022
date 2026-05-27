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
            $cleanRut = \App\Rules\ValidRut::clean($this->rut);
            if ($cleanRut === '66666666-6') {
                $patient = $this->route('patient');
                $patientModel = $patient instanceof \App\Models\Patient ? $patient : \App\Models\Patient::find($patient);
                if ($patientModel && str_starts_with($patientModel->getRawOriginal('rut') ?? '', '66666666-6-TEMP-')) {
                    $cleanRut = $patientModel->getRawOriginal('rut');
                } else {
                    do {
                        $cleanRut = '66666666-6-TEMP-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                    } while (\App\Models\Patient::withoutGlobalScopes()->where('rut', $cleanRut)->exists());
                }
            }
            $this->merge([
                'rut' => $cleanRut,
            ]);
        }
    }

    public function rules(): array
    {
        $patient = $this->route('patient');
        $patientId = $patient instanceof \App\Models\Patient ? $patient->id : $patient;
        $patientModel = $patient instanceof \App\Models\Patient ? $patient : \App\Models\Patient::find($patientId);

        // Si por alguna razón no hay ID en la ruta, lo buscamos en el body
        if (!$patientId && $this->has('id')) {
            $patientId = $this->id;
            if (!$patientModel) $patientModel = \App\Models\Patient::find($patientId);
        }

        // 🛡️ LÓGICA DE PROTECCIÓN DE RUT
        // Si el RUT ya existe y NO es un RUT temporal/comodín, restringimos su edición por permisos
        if ($patientModel && $this->has('rut')) {
            $originalRut = $patientModel->getRawOriginal('rut');
            $newRut = \App\Rules\ValidRut::clean($this->rut);
            
            // Solo evaluamos si el RUT está cambiando
            if ($originalRut !== $newRut) {
                $isOriginalPlaceholder = str_starts_with($originalRut ?? '', '66666666-6');
                
                // Si el original NO es un placeholder, requerimos permiso especial para editarlo
                if (!$isOriginalPlaceholder && !auth()->user()->can('patients.edit_rut')) {
                    // Inyectamos un error de validación inmediato
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'rut' => 'No tiene permisos para modificar el RUT de un paciente ya registrado. Contacte a un Superadmin.'
                    ]);
                }
            }
        }

        // Verificar si la sucursal actual requiere atención a domicilio obligatoria
        $activeBranchId = session('active_branch_id');
        $isHomeCareOnly = false;
        if ($activeBranchId) {
            $branch = \App\Models\Branch::find($activeBranchId);
            $isHomeCareOnly = $branch && !$branch->allows_onsite;
        }

        return [
            // Paciente
            'name'              => ['sometimes', 'required', 'string', 'max:255'],
            'last_name'         => ['sometimes', 'required', 'string', 'max:255'],
            'rut' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                new \App\Rules\ValidRut,
                Rule::unique('patients', 'rut')
                    ->where('company_id', session('current_company_id'))
                    ->ignore($patientId),
            ],
            'email'             => [
                'nullable',
                'string',
                'email',
                'max:255',
            ],
            'phone'             => ['nullable', 'string', 'max:30'],

            'birth_date'        => ['sometimes', 'required', 'date', 'before:today'],
            'gender'            => ['nullable', 'string', 'max:10'],
            'occupation'        => ['nullable', 'string', 'max:255'],
            'marital_status'    => ['nullable', 'string', 'max:50'],

            'require_tutor'     => ['boolean'],
            'opt_out_reminders' => ['boolean'],
            'prefers_whatsapp'  => ['boolean'],
            'prefers_sms'       => ['boolean'],
            'prefers_mail'      => ['boolean'],

            'status'            => ['nullable', 'string', 'max:50'],
            'status_reason'     => ['nullable', 'string', 'max:255'],
            'status_changed_at' => ['nullable', 'date'],

            'notes'             => ['nullable', 'string', 'max:1000'],

            // Dirección
            'street'            => [$isHomeCareOnly ? 'sometimes|required' : 'nullable', 'string', 'max:255'],
            'number'            => [$isHomeCareOnly ? 'sometimes|required' : 'nullable', 'string', 'max:50'],
            'details'           => ['nullable', 'string', 'max:500'],

            'region_id'         => ['nullable', 'integer', 'exists:regions,id'],
            'commune_id'        => [$isHomeCareOnly ? 'sometimes|required' : 'nullable', 'integer', 'exists:communes,id'],

            // Antecedentes Clínicos (Medical History)
            'blood_type'        => ['nullable', 'string', 'max:10'],
            'handedness'        => ['nullable', 'string', 'max:20'],
            'pathologies'       => ['nullable', 'array'],
            'surgeries'         => ['nullable', 'array'],
            'fractures'         => ['nullable', 'array'],
            'medications'       => ['nullable', 'array'],
            'family_history'    => ['nullable', 'array'],
            'has_pacemaker'     => ['sometimes', 'boolean'],
            'has_metal_implants'=> ['sometimes', 'boolean'],
            'is_pregnant'       => ['sometimes', 'boolean'],
            'cancer_history'    => ['sometimes', 'boolean'],
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
            'commune_id'        => 'comuna',
        ];
    }
}
