<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientContactRequest extends FormRequest
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
            'patient_id' => ['required', 'exists:patients,id'],
            'name'       => ['bail', 'required', 'string', 'max:120'],
            'email'         => ['required', 'string', 'email', 'max:255'],
            'phone'         => ['required', 'string', 'max:50'],
            'relationship'  => ['required', 'string', 'max:100'],
            'type'          => ['required', Rule::in(['emergency', 'guardian', 'other'])],
            'is_primary'    => ['boolean']
        ];
    }
}
