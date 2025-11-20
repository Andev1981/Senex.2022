<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionTypeRequest extends FormRequest
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
            'name' => 'required|string|max:255|min:5',
            'base_price' => 'required|integer|min:100|max:100000',
            'duration_minutes' => 'required|integer',
            'plan_eligible' => 'nullable|boolean',
            'plan_session_value' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ];
    }
}
