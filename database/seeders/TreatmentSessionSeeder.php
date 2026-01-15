<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Debt;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // <--- Importante para escribir en el log

class TreatmentSessionSeeder extends Seeder
{
    public function run($company, $branches, $doctors, $patients, $sessionTypes): void
    {
        $faker = Faker::create('es_CL');
        
        // 1. Validaciones DESTRUCTIVAS (Return directo)
        // Si falta cualquiera de estos datos, NO PODEMOS CONTINUAR.
        
        if (!$company) { Log::error("❌ [SEEDER] Falta Company"); return; }
        
        // Validar Colecciones vacías (Aquí estaba tu error)
        if ($branches->isEmpty()) {
            Log::error("❌ [SEEDER ERROR] La compañía {$company->id} NO tiene Sucursales. Se aborta TreatmentSessionSeeder.");
            return;
        }

        if ($doctors->isEmpty()) {
            Log::error("❌ [SEEDER ERROR] La compañía {$company->id} NO tiene Doctores. Se aborta TreatmentSessionSeeder.");
            return;
        }

        if ($patients->isEmpty()) {
            Log::error("❌ [SEEDER ERROR] La compañía {$company->id} NO tiene Pacientes. Se aborta TreatmentSessionSeeder.");
            return;
        }

        if ($sessionTypes->isEmpty()) {
            Log::error("❌ [SEEDER ERROR] La compañía {$company->id} NO tiene Tipos de Sesión (SessionTypes). Se aborta TreatmentSessionSeeder.");
            return; 
        }

        Log::info("✅ [SEEDER START] Iniciando carga masiva para Company {$company->id} | {$patients->count()} Pacientes | {$branches->count()} Sucursales");

        $treatmentStatuses = ['evaluation', 'in_progress', 'completed', 'paused', 'cancelled'];
        // ... (El resto de tu código sigue igual)
        $sessionStatuses = ['scheduled','in_progress','completed','cancelled','not_show','confirmed'];

        foreach ($patients as $patient) {
            Log::info("[SEEDER] Procesando Paciente ID {$patient->id}...");
            try {
                

                // A. Resolver Branch y Tipo
                $randomBranch = $branches->random();
                $branchId = is_object($randomBranch) ? $randomBranch->id : $randomBranch;
                $mainSessionType = $sessionTypes->random();

                // B. Crear Tratamiento
                $treatmentStatus = $faker->randomElement($treatmentStatuses);
                $treatment = Treatment::create([
                    'company_id'      => $company->id,
                    'branch_id'       => $branchId,
                    'patient_id'      => $patient->id,
                    'doctor_id'       => $doctors->random()->id,
                    'session_type_id' => $mainSessionType->id,
                    'status'          => $treatmentStatus,
                    'start_date'      => now()->subDays(rand(30, 180)),
                    'end_date'        => in_array($treatmentStatus, ['completed', 'cancelled']) ? now()->subDays(rand(1, 29)) : null,
                ]);

                // C. Crear Sesiones
                $sessionsCount = rand(3, 10);

                for ($i = 0; $i < $sessionsCount; $i++) {
                    $currentSessionType = $sessionTypes->random(); 
                    $sessionStatus = $faker->randomElement($sessionStatuses);
                    $sessionDate = now()->subDays(rand(1, 30));

                    $session = TreatmentSession::create([
                        'company_id'         => $company->id,
                        'branch_id'          => $branchId,
                        'treatment_id'       => $treatment->id,
                        'doctor_id'          => $doctors->random()->id,
                        'patient_id'         => $patient->id,
                        'session_type_id'    => $currentSessionType->id,
                        'date'               => $sessionDate,
                        'time'               => 45,
                        'status'             => $sessionStatus,
                        'patient_amount_clp' => $currentSessionType->base_price_clp ?? 0,
                        'doctor_amount_clp'  => $currentSessionType->default_doctor_commission_clp ?? 0,
                        'clinic_amount_clp'  => ($currentSessionType->base_price_clp ?? 0) - ($currentSessionType->default_doctor_commission_clp ?? 0)
                    ]);

                    if ($sessionStatus === 'cancelled') continue; 

                    // D. Lógica Financiera
                    $debtStatus = ($sessionStatus === 'completed') ? 'paid' : 'pending';
                    $paidAmount = ($debtStatus === 'paid') ? $session->patient_amount_clp : 0;

                    // 1. Deuda
                    $debt = Debt::create([
                        'company_id'           => $company->id,
                        'patient_id'           => $patient->id,
                        'treatment_session_id' => $session->id,
                        'original_amount'      => $session->patient_amount_clp,
                        'paid_amount'          => $paidAmount,
                        'status'               => $debtStatus,
                    ]);

                    // 2. Pago y Factura (Solo si pagado)
                    if ($debtStatus === 'paid') {
                        $payment = Payment::create([
                            'uuid'            => $faker->uuid,
                            'company_id'      => $company->id,
                            'branch_id'       => $branchId,
                            'user_id'         => 1, 
                            'patient_id'      => $patient->id,
                            'amount_clp'      => $session->patient_amount_clp,
                            'payment_date'    => $sessionDate,
                            'payment_method'  => $faker->randomElement(['webpay','cash','transfer']),
                            'status'          => 'completed',
                        ]);

                        $invoice = Invoice::create([
                            'company_id'       => $company->id,
                            'branch_id'        => $branchId,
                            'user_id'          => 1,
                            'patient_id'       => $patient->id,
                            'payment_id'       => $payment->id,
                            'entity_type'      => 'SessionType',
                            'entity_id'       => $currentSessionType->id,
                            'payment_status'   => 'paid',
                            'amount_total_clp' => $session->patient_amount_clp,
                            'dte_status'       => 'accepted', 
                            'dte_type'         => 39,
                            'issue_date'       => $sessionDate,
                        ]);

                        InvoiceItem::create([
                            'invoice_id'           => $invoice->id,
                            'company_id'           => $company->id,
                            'branch_id'            => $branchId,
                            'treatment_session_id' => $session->id,
                            'sellable_type'        => 'TreatmentSession',
                            'sellable_id'          => $session->id,
                            'description'          => 'Sesión Seeder',
                            'quantity'             => 1,
                            'unit_price_clp'       => $session->patient_amount_clp * 1,
                            'unit_patient_clp'     => $session->patient_amount_clp * 1,
                            'total_gross_clp'      => $session->patient_amount_clp,
                            'total_patient_clp'    => $session->patient_amount_clp,
                        ]);

                        PaymentAllocation::create([
                            'company_id'           => $company->id,
                            'branch_id'            => $branchId,
                            'payment_id'           => $payment->id,
                            'debt_id'              => $debt->id,
                            'payment_id'           => $payment->id,
                            'treatment_session_id' => $session->id,
                            'amount_clp'           => $session->patient_amount_clp,
                        ]);
                    }
                }

              

            } catch (\Exception $e) {
             
                // ESTO ESCRIBIRÁ EN storage/logs/laravel.log
                Log::error("[SEEDER ERROR] Falló Paciente ID {$patient->id}: " . $e->getMessage());
            }
        }
        
        Log::info("[SEEDER END] Proceso finalizado.");
    }
}