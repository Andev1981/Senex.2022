<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Receivable;
use App\Models\SessionType;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PaymentFlowSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Datos base
            $patient = Patient::first() ?? Patient::factory()->create();
            $sessionType = SessionType::first() ?? SessionType::factory()->create(['base_price_clp' => 50000]);

            $mockCartData = [
                'final_shares' => [
                    'amount_gross_clp' => 50000,
                    'amount_insurance_primary_clp' => 35000,
                    'amount_insurance_secondary_clp' => 5000,
                    'amount_patient_clp' => 10000,
                    'discount_clp' => 0
                ],
                'coverage_details' => [
                    'insurance_id' => 1,
                    'secondary_insurance_id' => 2,
                    'external_transaction_code' => 'IMED-998877'
                ],
                'services_to_bill' => [
                    [
                        'session_type_id' => $sessionType->id,
                        'name' => $sessionType->name,
                        'quantity' => 1,
                        'unit_price_clp' => 50000,
                        'unit_insurance_primary_clp' => 35000,
                        'unit_insurance_secondary_clp' => 5000,
                        'unit_patient_clp' => 10000
                    ]
                ]
            ];

            // 2. Crear el PAGO
            $payment = Payment::create([
                'uuid' => (string) Str::uuid(),
                'patient_id' => $patient->id,
                'company_id' => 1,
                'branch_id' => 1,
                'amount_clp' => 10000,
                'amount_gross_clp' => 50000,
                'amount_insurance_primary_clp' => 35000,
                'amount_insurance_secondary_clp' => 5000,
                'payment_method' => 'cash',
                'status' => 'completed',
                'payment_date' => now(),
                'paid_at' => now(),
                'metadata' => $mockCartData
            ]);

            // 3. CREAR EL INVOICE (Aquí faltaban los campos entity)
            // Como es copago, el deudor de ESTA boleta es el paciente
            $invoice = Invoice::create([
                'company_id' => 1,
                'branch_id' => 1,
                'user_id' => 1, // Usuario por defecto (Admin)
                'patient_id' => $patient->id,
                'payment_id' => $payment->id,

                // 🎯 CAMPOS AGREGADOS:
                'entity_type' => Patient::class,
                'entity_id'   => $patient->id,

                'amount_gross_clp' => 50000,
                'amount_patient_clp' => 10000,
                'amount_insurance_primary_clp' => 35000,
                'amount_insurance_secondary_clp' => 5000,
                'amount_total_clp' => 10000,
                'dte_type' => 39,
                'issue_date' => now(),
                'dte_status' => 'PENDIENTE'
            ]);

            $invoice->items()->create([
                'company_id' => 1,
                'branch_id' => 1,
                'session_type_id' => $sessionType->id, // Faltaba este para la FK
                'description' => $sessionType->name,
                'quantity' => 1,
                'unit_price_clp' => 50000,
                'total_gross_clp' => 50000,
                'total_patient_clp' => 10000,
                'unit_insurance_primary_clp' => 35000,
                'unit_insurance_secondary_clp' => 5000,
                'unit_patient_clp' => 10000
            ]);

            // 4. Receivables
            Receivable::create([
                'company_id' => 1,
                'branch_id' => 1,
                'payment_id' => $payment->id,
                'patient_id' => $patient->id,
                'insurance_id' => 1,
                'insurance_type' => 'primary',
                'amount_clp' => 35000,
                'external_transaction_code' => 'IMED-998877',
                'status' => 'pending',
                'due_date' => now()->addDays(30)
            ]);
        });
    }
}
