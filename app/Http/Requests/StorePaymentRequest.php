<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $activeBranchId = session('active_branch_id');
        $companyId = session('current_company_id');
        $userId = auth()->user()->id;

        // 1. Inyectar IDs de contexto (Prioriza request, si no, usa sesión)
        $this->merge([
            'company_id' => $this->company_id ?: $companyId,
            'branch_id'  => $this->branch_id  ?: $activeBranchId,
            'user_id'  => $this->user_id  ?: $userId,
        ]);

        // 2. Sincronizar campo raíz amount_total para validación (Desde final_shares)
        if ($this->has('final_shares.amount_patient')) {
            $this->merge([
                'amount_total' => $this->input('final_shares.amount_patient'),
            ]);
        }

        // 3. Limpieza de Cobertura si no hay Isapre
        if ($this->has('coverage_details') && empty($this->input('coverage_details.insurance_id'))) {
            $this->merge(['coverage_details' => null]);
        }

        // 4. Normalizar ítems del carrito
        if ($this->has('services_to_bill')) {
            $items = collect($this->input('services_to_bill'))->map(function ($item) {
                return [
                    'session_type_id' => $item['session_type_id'],
                    'doctor_id'       => $item['doctor_id'] ?: null,
                    'quantity'        => $item['quantity'] ?: 1,
                    'unit_price'      => (int) ($item['unit_price'] ?: 0),
                    'unit_insurance_primary'   => (int) ($item['unit_insurance_primary'] ?? 0),
                    'unit_insurance_secondary' => (int) ($item['unit_insurance_secondary'] ?? 0),
                    'unit_patient'             => (int) ($item['unit_patient'] ?? 0),
                    'debt_id'         => $item['debt_id'] ?? null,
                    'treatment_id'    => $item['treatment_id'] ?? null,
                    'session_id'      => $item['session_id'] ?? null,
                ];
            })->toArray();

            $this->merge(['services_to_bill' => $items]);
        }
    }

    public function rules(): array
    {
        return [
            // --- Contexto ---
            'user_id' => ['required', 'exists:users,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'company_id' => ['required', 'exists:companies,id'],
            'branch_id'  => ['required', 'exists:branches,id'],
            'amount_total' => ['required', 'numeric', 'min:0'], // El copago a validar en raíz

            // --- Cobertura (Metadata) ---
            'coverage_details' => ['nullable', 'array'],
            'coverage_details.insurance_id' => ['nullable', 'exists:insurances,id'],
            'coverage_details.secondary_insurance_id' => ['nullable', 'exists:insurances,id'],
            'coverage_details.plan_id' => ['nullable', 'exists:plans,id'],
            'coverage_details.external_transaction_code' => ['nullable', 'string'],
            'coverage_details.affiliate_rut' => ['required_with:coverage_details.insurance_id', 'nullable', 'string'],

            // --- Servicios (El Carrito) ---
            'services_to_bill' => ['required', 'array', 'min:1'],
            'services_to_bill.*.session_type_id' => ['required', 'exists:session_types,id'],
            'services_to_bill.*.quantity'        => ['required', 'numeric', 'min:1'],
            'services_to_bill.*.unit_price'      => ['required', 'numeric'],
            'services_to_bill.*.unit_patient'    => ['required', 'numeric'],
            'services_to_bill.*.doctor_id'       => ['required_without:services_to_bill.*.debt_id', 'nullable', 'exists:doctors,id'],

            // --- Detalles del Pago Físico ---
            'payment_details' => ['required', 'array'],
            'payment_details.payment_method' => ['required', 'string'],
            'payment_details.amount_paid'    => ['required', 'numeric', 'min:0'],
            'payment_details.payment_date'    => ['required', 'date'],

            // --- Shares Finales (Para Invoices y Receivables) ---
            'final_shares' => ['required', 'array'],
            'final_shares.amount_gross'               => ['required', 'numeric'],
            'final_shares.amount_insurance_primary'   => ['required', 'numeric'],
            'final_shares.amount_insurance_secondary' => ['required', 'numeric'],
            'final_shares.amount_patient'             => ['required', 'numeric'],
            'final_shares.discount'                   => ['required', 'numeric'],
        ];
    }


    public function messages(): array
    {
        return [
            // Mensajes de Contexto
            'patient_id.required' => 'Debes seleccionar un paciente para procesar el cobro.',
            'patient_id.exists'   => 'El paciente seleccionado no es válido.',
            'branch_id.required'  => 'La sucursal no ha sido detectada. Por favor, reinicia tu sesión.',

            // Mensajes de Cobertura
            'coverage_details.insurance_id.required_with' => 'Si indicas un plan, la Isapre/Fonasa es obligatoria.',
            'coverage_details.affiliate_rut.required_with' => 'El RUT del afiliado es obligatorio para pagos con seguro.',

            // Mensajes de Carrito (Servicios)
            'services_to_bill.required' => 'El carrito está vacío. Añade al menos una prestación.',
            'services_to_bill.min'      => 'Debes seleccionar al menos un servicio para facturar.',
            'services_to_bill.*.session_type_id.required' => 'Falta el tipo de prestación en una de las líneas.',
            'services_to_bill.*.doctor_id.required_without' => 'Debes asignar un profesional a las nuevas prestaciones.',
            'services_to_bill.*.unit_price.required' => 'El precio unitario no puede estar vacío.',

            // Mensajes de Pago
            'payment_details.payment_method.required' => 'Selecciona un medio de pago (Efectivo, Webpay, etc.).',
            'payment_details.amount_paid.required'    => 'El monto a pagar es obligatorio.',
            'payment_details.payment_date.required'   => 'La fecha del pago es obligatoria.',

            // Mensajes de Totales (Consistencia)
            'final_shares.amount_gross.required' => 'Error en el cálculo: Falta el total bruto.',
            'final_shares.amount_patient.required' => 'Error en el cálculo: El copago no ha sido definido.',
            'final_shares.amount_patient.min' => 'El copago no puede ser un valor negativo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'final_shares.amount_gross' => 'Total Bruto',
            'final_shares.amount_insurance_primary' => 'Aporte Isapre',
            'final_shares.amount_insurance_secondary' => 'Aporte Complementario',
            'final_shares.amount_patient' => 'Copago',
            'payment_details.payment_method' => 'Medio de Pago',
            'services_to_bill.*.doctor_id' => 'Profesional',
        ];
    }
}
