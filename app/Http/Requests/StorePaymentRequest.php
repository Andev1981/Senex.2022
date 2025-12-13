<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }
  public function rules(): array
  {
    return [
      'patient_id' => 'required',
      'payment_date' => 'required',
      'amount_clp' => 'required',
      'paid_at' => 'required',
      'payment_method' => 'required',
      'transaction_reference' => 'nullable',
      'status' => 'required',
      'notes' => 'nullable',
      'session_ids' => 'required|array',
    ];
  }

  public function messages(): array
  {
      return [
          'patient_id.required'     => 'Debe seleccionar un paciente para registrar el pago.',
          'payment_date.required'   => 'La fecha del pago es obligatoria.',
          'amount_clp.required'     => 'Debe ingresar el monto total del pago.',
          'paid_at.required'        => 'La fecha de confirmación del pago es obligatoria.',
          'payment_method.required' => 'Debe seleccionar un método de pago (Efectivo, Transferencia, etc.).',
          'status.required'         => 'El estado del pago es obligatorio.',
          'session_ids.required'    => 'Debe seleccionar al menos una sesión para asociar este pago.',
          'session_ids.array'       => 'El formato de las sesiones seleccionadas no es válido.',
      ];
  }
}
