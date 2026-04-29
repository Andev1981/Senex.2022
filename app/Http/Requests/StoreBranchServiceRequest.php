<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'item_id' => ['required', 'exists:items,id'],
            'custom_price_clp' => ['nullable', 'integer', 'min:0'],
            'custom_duration_minutes' => ['nullable', 'integer', 'min:0'],
            'is_active_in_branch' => ['required', 'boolean'],
            'custom_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}
