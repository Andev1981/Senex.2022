<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajustar según permisos si es necesario
    }

    public function rules(): array
    {
        $companyId = session('current_company_id');

        return [
            'type'           => 'required|string|in:product,service',
            'category_id'    => 'nullable|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            // El SKU debe ser único dentro de la misma empresa
            'sku'            => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('products')->where(fn($query) => $query->where('company_id', $companyId))
            ],
            'barcode'        => 'nullable|string|max:100',
            'cost_price'     => 'nullable|integer|min:0',
            'price'          => 'required|integer|min:0',
            'stock'          => 'required|integer',
            'critical_stock' => 'nullable|integer|min:0',
            'is_exempt'      => 'boolean',
            'manage_stock'   => 'boolean',
            'is_active'      => 'boolean',
        ];
    }
}
