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

        $treatmentStatuses = ['evaluation', 'in_progress', 'completed', 'paused', 'cancelled'];
        $sessionStatuses = ['scheduled', 'completed', 'no_show', 'cancelled']; // Usar los estados definidos en TreatmentSession

        foreach ($patients as $patient) {
            if ($doctors->isEmpty() || $sessionTypes->isEmpty()) {
                continue;
            }

            // Crear un Tratamiento con estado aleatorio
            $treatmentStatus = $faker->randomElement($treatmentStatuses);
            $treatment = Treatment::create([
                'company_id' => $company->id,
                'branch_id' => $branches->random(),
                'patient_id' => $patient->id,
                'doctor_id' => $doctors->random()->id,
                'session_type_id' => $sessionTypes->random()->id,
                'status' => $treatmentStatus, // Estado aleatorio
                'start_date' => now()->subDays(rand(30, 180)),
                'end_date' => in_array($treatmentStatus, ['completed', 'cancelled']) ? now()->subDays(rand(1, 29)) : null,
            ]);

            // Crear entre 3 y 10 sesiones por tratamiento
            for ($i = 0; $i < rand(3, 10); $i++) {
                $sessionStatus = $faker->randomElement($sessionStatuses); // Estado de sesión aleatorio
                TreatmentSession::create([
                    'company_id' => $company->id,
                    'branch_id' => $branches->random(),
                    'treatment_id' => $treatment->id,
                    'doctor_id' => $doctors->random()->id,
                    'patient_id' => $patient->id,
                    'session_type_id' => $sessionTypes->random()->id,
                    'date' => now()->subDays(rand(1, 30)),
                    'status' => $sessionStatus, // Estado de sesión aleatorio
                    'patient_amount_clp' => $sessionTypes->random()->base_price_clp,
                    'doctor_amount_clp' => $sessionTypes->random()->default_doctor_commission_clp,
                ]);
            }
        }
    }
}
