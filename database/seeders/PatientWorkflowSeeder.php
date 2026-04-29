<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\Doctor;
use App\Models\Company;
use App\Models\Item;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PatientWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('rut', '76765699-8')->first();
        $sportBranch = $company->branches()->where('name', 'Senex Sport')->first();
        $doctorSport = Doctor::where('email', 'kine.sport@senex.cl')->first();
        $itemClinic = Item::where('sku', 'KINE-CLINIC')->first();

        // 1. Crear Paciente
        $patient = Patient::updateOrCreate(
            ['rut' => '19.888.777-6'],
            [
                'company_id' => $company->id,
                'name' => 'Juan',
                'last_name' => 'Paciente Sport',
                'email' => 'juan.paciente@gmail.com',
                'phone' => '+56912345678',
                'birth_date' => '1995-05-10',
                'status' => 'active'
            ]
        );
        $patient->branches()->sync([$sportBranch->id]);

        // 2. Crear Tratamiento
        $treatment = Treatment::updateOrCreate(
            ['patient_id' => $patient->id, 'company_id' => $company->id, 'doctor_id' => $doctorSport->id],
            [
                'branch_id' => $sportBranch->id,
                'item_id' => $itemClinic->id,
                'referral_diagnosis' => 'Esguince de Tobillo Grado 2',
                'description' => 'Tratamiento de rehabilitación deportiva post esguince.',
                'status' => 'in_progress',
                'total_sessions' => 10,
                'completed_sessions' => 0,
                'start_date' => now()
            ]
        );

        // 3. Crear Sesión para HOY
        TreatmentSession::updateOrCreate(
            ['treatment_id' => $treatment->id, 'date' => now()->toDateString()],
            [
                'company_id' => $company->id,
                'branch_id' => $sportBranch->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctorSport->id,
                'item_id' => $itemClinic->id,
                'time' => '10:00:00',
                'status' => 'scheduled',
                'patient_amount_clp' => $itemClinic->price,
                'doctor_amount_clp' => 12000
            ]
        );

        $this->command->info('Juan Paciente creado con cita para hoy en Senex Sport.');
    }
}
