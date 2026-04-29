<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $companyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');
        
        // Fallback: Si no hay sucursal en sesión, buscar la primera de la empresa
        if (!$activeBranchId && $companyId) {
            $activeBranchId = \App\Models\Branch::where('company_id', $companyId)->first()?->id;
        }

        $userId = auth()->user()->id;

        // --- MANEJO DE ID CON PREFIJO ---
        $rawPatientId = $this->input('patient_id');
        $numericPatientId = $rawPatientId;
        if (is_string($rawPatientId)) {
            $numericPatientId = (int) str_replace(['person_', 'company_'], '', $rawPatientId);
        }

        // 1. Inyectar IDs de contexto
        $this->merge([
            'company_id' => $this->company_id ?: $companyId,
            'branch_id'  => $this->branch_id  ?: $activeBranchId,
            'user_id'    => $this->user_id     ?: $userId,
            'patient_id' => $numericPatientId, // Inyectamos el ID puro para las reglas de Laravel
        ]);

        // 2. Sincronizar campos de monto total (Aliasing para compatibilidad)
        if ($this->has('final_shares.amount_patient_clp')) {
            $total = $this->input('final_shares.amount_patient_clp');
            $this->merge([
                'amount_total_clp' => $total,
                'amount_clp'       => $total, // La llave que el Service busca
            ]);
        }

        // 3. Limpieza de Cobertura si no hay Isapre
        if ($this->has('coverage_details') && empty($this->input('coverage_details.insurance_id'))) {
            $this->merge(['coverage_details' => null]);
        }

        // 4. Normalizar ítems del carrito de forma robusta
        if ($this->has('services_to_bill')) {
            $items = collect($this->input('services_to_bill'))->map(function ($item) {
                // Definir un array de valores por defecto
                $defaults = [
                    'item_id' => null,
                    'doctor_id'       => null,
                    'quantity'        => 1,
                    'unit_price_clp'      => 0,
                    'unit_insurance_primary_clp'   => 0,
                    'unit_insurance_secondary_clp' => 0,
                    'unit_patient_clp'             => 0,
                    'is_exempt'       => true, // Por defecto exento (prestación de salud)
                    'debt_id'         => null,
                    'treatment_id'    => null,
                    'treatment_session_id'      => null,
                    'is_plan'         => false,
                    'plan_id'         => null,
                ];
                // Fusionar los valores por defecto con el item que viene del request.
                return array_merge($defaults, $item);
            })->toArray();

            $this->merge(['services_to_bill' => $items]);
        }
    }

    public function rules(): array
    {
        $rawPatientId = $this->request->get('patient_id'); // El original del form (con prefijo)
        $patientTable = str_contains($rawPatientId, 'company_') ? 'companies_directory' : 'patients';

        return [
            // --- Contexto ---
            'user_id' => ['required', 'exists:users,id'],
            'patient_id' => ['required', "exists:{$patientTable},id"],
            'company_id' => ['required', 'exists:companies,id'],
            'branch_id'  => ['required', 'exists:branches,id'],
            'amount_total_clp' => ['required', 'numeric', 'min:0'], 
            'amount_clp' => ['required', 'numeric', 'min:0'], 

            // --- Cobertura (Metadata) ---
            'coverage_details' => ['nullable', 'array'],
            'coverage_details.insurance_id' => ['nullable', 'exists:insurances,id'],
            'coverage_details.secondary_insurance_id' => ['nullable', 'exists:insurances,id'],
            'coverage_details.plan_id' => ['nullable', 'exists:plans,id'],
            'coverage_details.external_transaction_code' => ['nullable', 'string'],
            'coverage_details.affiliate_rut' => ['required_with:coverage_details.insurance_id', 'nullable', 'string'],

            // El sellable_id es el que identifica qué se está vendiendo (SessionType o Product)
            'services_to_bill.*.sellable_id'   => ['nullable'],
            'services_to_bill.*.sellable_type' => ['nullable', 'string'],
            'services_to_bill.*.treatment_session_id' => ['nullable', 'exists:treatment_sessions,id'],
            'services_to_bill.*.invoice_id' => ['nullable', 'exists:invoices,id'],
            'services_to_bill.*.name' => ['nullable', 'string'],
            'services_to_bill.*.quantity' => ['required', 'integer', 'min:1'],
            'services_to_bill.*.unit_price_clp' => ['required', 'numeric'],
            'services_to_bill.*.unit_insurance_primary_clp' => ['nullable', 'numeric'],
            'services_to_bill.*.unit_insurance_secondary_clp' => ['nullable', 'numeric'],
            'services_to_bill.*.unit_patient_clp' => ['required', 'numeric'],
            'services_to_bill.*.is_exempt' => ['nullable', 'boolean'],
            'services_to_bill.*.debt_id' => ['nullable'],
            'services_to_bill.*.treatment_id' => ['nullable'],
            
            // Validación Condicional para doctor_id
            'services_to_bill.*.doctor_id' => ['nullable'], 
            
            // --- Detalles del Pago Físico ---
            
            
            'payment_details' => ['required', 'array'],
            'payment_details.payment_method' => ['required', 'string'],
            'payment_details.amount_paid'    => ['required', 'numeric', 'min:0'],
            'payment_details.payment_date'    => ['required', 'date'],

            // --- Shares Finales (Para Invoices y Receivables) ---
            'final_shares' => ['required', 'array'],
            'final_shares.amount_gross_clp'               => ['required', 'numeric'],
            'final_shares.amount_insurance_primary_clp'   => ['required', 'numeric'],
            'final_shares.amount_insurance_secondary_clp' => ['required', 'numeric'],
            'final_shares.amount_patient_clp'             => ['required', 'numeric'],
            'final_shares.discount_clp'                   => ['required', 'numeric'],
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
            'services_to_bill.*.item_id.required' => 'Falta el tipo de prestación en una de las líneas.',
            'services_to_bill.*.doctor_id.required_without' => 'Debes asignar un profesional a las nuevas prestaciones.',
            'services_to_bill.*.unit_price_clp.required' => 'El precio unitario no puede estar vacío.',

            // Mensajes de Pago
            'payment_details.payment_method.required' => 'Selecciona un medio de pago (Efectivo, Webpay, etc.).',
            'payment_details.amount_paid.required'    => 'El monto a pagar es obligatorio.',
            'payment_details.payment_date.required'   => 'La fecha del pago es obligatoria.',

            // Mensajes de Totales (Consistencia)
            'final_shares.amount_gross_clp.required' => 'Error en el cálculo: Falta el total bruto.',
            'final_shares.amount_patient_clp.required' => 'Error en el cálculo: El copago no ha sido definido.',
            'final_shares.amount_patient_clp.min' => 'El copago no puede ser un valor negativo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'final_shares.amount_gross_clp' => 'Total Bruto',
            'final_shares.amount_insurance_primary_clp' => 'Aporte Isapre',
            'final_shares.amount_insurance_secondary_clp' => 'Aporte Complementario',
            'final_shares.amount_patient_clp' => 'Copago',
            'payment_details.payment_method' => 'Medio de Pago',
            'services_to_bill.*.doctor_id' => 'Profesional',
        ];
    }
}
