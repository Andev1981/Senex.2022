<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class TreatmentSessionSeeder extends Seeder
{
    public function run(array $parameters = null)
    {
        $faker = Faker::create('es_CL');
        $company = $parameters['company'];
        $branches = $parameters['branches'];
        $patients = Patient::where('company_id', $company->id)->get();
        $doctors = Doctor::where('company_id', $company->id)->get();
        $sessionTypes = SessionType::where('company_id', $company->id)->get();

        foreach ($patients as $patient) {
            if ($doctors->isEmpty() || $sessionTypes->isEmpty()) {
                continue;
            }

            $treatment = Treatment::create([
                'company_id' => $company->id,
                'branch_id' => $branches->random(),
                'patient_id' => $patient->id,
                'doctor_id' => $doctors->random()->id,
                'session_type_id' => $sessionTypes->random()->id,
                'status' => 'in_progress',
                'start_date' => now(),
            ]);

            for ($i = 0; $i < 5; $i++) {
                TreatmentSession::create([
                    'company_id' => $company->id,
                    'branch_id' => $branches->random(),
                    'treatment_id' => $treatment->id,
                    'doctor_id' => $doctors->random()->id,
                    'patient_id' => $patient->id,
                    'session_type_id' => $sessionTypes->random()->id,
                    'date' => now()->subDays(rand(1, 30)),
                    'status' => 'completed',
                    'patient_amount_clp' => $sessionTypes->random()->base_price_clp,
                    'doctor_amount_clp' => $sessionTypes->random()->default_doctor_commission_clp,
                ]);
            }
        }
    }
}
