<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentNowRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }
  public function rules(): array
  {
    return [
      'method' => ['required', 'in:webpay,cash,transfer,insurance'],
    ];
  }

  public function messages(): array
  {
    return [
      'method.required' => 'El método de pago es obligatorio',
      'method.in'       => 'El método de pago no es válido',
    ];
  }
}
