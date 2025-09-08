<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressStoreRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'addressable_type' => ['required', 'string', 'in:App\Models\Patient,App\Models\Doctor,App\Models\Branch'],
      'addressable_id'   => ['required', 'integer'],
      'type'             => ['nullable', 'in:home,work,billing,shipping,other'],
      'is_primary'       => ['boolean'],
      'line1'            => ['required', 'string', 'max:255'],
      'line2'            => ['nullable', 'string', 'max:255'],
      'city'             => ['nullable', 'string', 'max:120'],
      'region'           => ['nullable', 'string', 'max:120'],
      'country'          => ['nullable', 'string', 'max:2'], // 'CL', 'AR', etc.
      'postal_code'      => ['nullable', 'string', 'max:20'],
      'lat'              => ['nullable', 'numeric', 'between:-90,90'],
      'lng'              => ['nullable', 'numeric', 'between:-180,180'],
      'notes'            => ['nullable', 'string', 'max:500'],
    ];
  }
}
