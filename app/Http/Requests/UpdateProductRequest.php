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
        $companyId = auth()->user()->company_id;
        $productId = $this->route('product')->id;

        return [
            'type'           => 'required|string|in:product,service',
            'category_id'    => 'nullable|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'sku'            => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('items')->where(fn($q) => $q->where('company_id', $companyId))->ignore($productId)
            ],
            'price'          => 'required|integer|min:0',
            'is_exempt'      => 'nullable|boolean',
            'is_active'      => 'nullable|boolean',

            // Campos específicos de Producto
            'barcode'        => 'nullable|string|max:100',
            'cost_price'     => 'nullable|integer|min:0',
            'stock'          => 'required_if:type,product|integer',
            'critical_stock' => 'nullable|integer|min:0',
            'manage_stock'   => 'nullable|boolean',

            // Campos específicos de Servicio (solo validados si type === service)
            'duration_minutes'              => 'required_if:type,service|integer|min:1',
            'commission_type'               => 'nullable|string|in:fixed_amount,percentage',
            'default_doctor_commission_clp' => [
                'nullable', 'integer', 'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->commission_type === 'fixed_amount' && $value > $this->price) {
                        $fail('La comisión base no puede exceder el precio de venta.');
                    }
                }
            ],
            'default_doctor_commission_own_clp' => [
                'nullable', 'integer', 'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->commission_type === 'fixed_amount' && $value > $this->price) {
                        $fail('La comisión para paciente propio no puede exceder el precio de venta.');
                    }
                }
            ],
            'default_doctor_commission_assigned_clp' => [
                'nullable', 'integer', 'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->commission_type === 'fixed_amount' && $value > $this->price) {
                        $fail('La comisión para paciente asignado no puede exceder el precio de venta.');
                    }
                }
            ],
            'default_doctor_commission_percentage' => 'nullable|numeric|min:0|max:100',
            'default_doctor_commission_own_percentage' => 'nullable|numeric|min:0|max:100',
            'default_doctor_commission_assigned_percentage' => 'nullable|numeric|min:0|max:100',
            'requires_diagnosis'            => 'nullable|boolean',
            'requires_referral'             => 'nullable|boolean',
            'specialty'                     => 'nullable|string|max:100',
            'billing_code'                  => 'nullable|string|max:50',
            'agenda_color'                  => 'nullable|string|max:10',
            'patient_instructions'          => 'nullable|string|max:2000',
            'allows_onsite'                 => 'nullable|boolean',
            'allows_online'                 => 'nullable|boolean',
            'allows_home'                   => 'nullable|boolean',
            'max_simultaneous_patients'     => 'nullable|integer|min:1|max:10',
            'requires_consent'              => 'nullable|boolean',
            ];
            }
            }
