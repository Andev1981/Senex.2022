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
      'type' => ['nullable', 'in:boleta,factura,nota_credito,nota_debito'],
    ];
  }
}
