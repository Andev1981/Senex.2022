<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVitalRequest extends FormRequest
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

    protected function prepareForValidation(): void
    {
        // Sobrescribe cualquier valor del cliente
        $this->merge([
            'recorded_by_user_id' => auth()->id(),
        ]);
    }

    public function rules()
    {
        return [
            'patient_id' => ['required','exists:patients,id'],
            'recorded_by_user_id' => ['required','exists:users,id'],
            'height_cm' => ['nullable','numeric'],
            'weight_kg' => ['nullable','numeric'],
            'bp_diastolic' => ['nullable','numeric'],
            'bp_systolic' => ['nullable','numeric'],
            'resp_rate' => ['nullable','numeric'],
            'heart_rate' => ['nullable','numeric'],
            'spo2' => ['nullable','numeric'],
            'temperature_c' => ['nullable','numeric'],
            'blood_type' => ['nullable','in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
        ];
    }
}
