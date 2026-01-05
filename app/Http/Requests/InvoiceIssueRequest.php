<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceIssueRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }
  public function rules(): array
  {
    return [
      'dte_type' => ['nullable', 'in:boleta,factura,nota_credito,nota_debito'],
    ];
  }

  public function messages(): array
  {
    return [
      'dte_type.in' => 'El tipo de documento seleccionado no es válido (boleta, factura, nota_credito, nota_debito).',
    ];
  }
}
