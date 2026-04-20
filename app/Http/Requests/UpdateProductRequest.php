<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = session('current_company_id');
        $productId = $this->route('product')->id; // ID del producto que estamos editando

        return [
            'type'           => 'required|string|in:product,service',
            'category_id'    => 'nullable|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'sku'            => [
                'nullable',
                'string',
                'max:50',
                // Único en la empresa, pero ignorando este producto
                Rule::unique('products')->where(fn($q) => $q->where('company_id', $companyId))->ignore($productId)
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
