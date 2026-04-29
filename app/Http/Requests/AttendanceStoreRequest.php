<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceStoreRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'patient_id'      => ['required', 'integer'],
      'doctor_id'       => ['required', 'integer'],
      'item_id' => ['required', 'integer'],
      'treatment_id'    => ['nullable', 'integer'],
      'appointment_id'  => ['nullable', 'integer'],
      'attended_at'     => ['nullable', 'date'],
      'patient_amount_clp'  => ['nullable', 'numeric', 'min:0'],
      'notes'           => ['nullable', 'string', 'max:1000'],

      'payment.mode'    => ['nullable', 'in:now,debt,planOnly'],
      'payment.method'  => ['nullable', 'in:webpay,cash,transfer,insurance'],
      'dte.issue'       => ['nullable', 'boolean'],
      'dte.type'        => ['nullable', 'in:boleta,factura,nota_credito,nota_debito'],
    ];
  }
}
