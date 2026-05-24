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
use App\Models\Allergy;
use App\Models\Condition;
use App\Models\VitalSign;
use App\Models\PatientAllergy;
use App\Models\PatientCondition;
use App\Models\PatientLifestyle;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeepClinicalDataSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('rut', '76765699-8')->first();
        if (!$company) return;

        $sportBranch = $company->branches()->where('name', 'Chesterton')->first();
        $doctorSport = Doctor::where('email', 'kine.sport@senex.cl')->first();
        $itemClinic = Item::where('sku', 'KINE-CLINIC')->first();

        // 1. Crear Paciente Maestro
        $patient = Patient::updateOrCreate(
            ['rut' => '17.222.333-4'],
            [
                'company_id' => $company->id,
                'name' => 'Ricardo',
                'last_name' => 'Paciente Experto',
                'email' => 'ricardo.pro@gmail.com',
                'phone' => '+56999998888',
                'birth_date' => '1988-03-15',
                'gender' => 'male',
                'status' => 'active'
            ]
        );
        $patient->branches()->sync([$sportBranch->id]);

        // 2. Alergias
        $a1 = Allergy::updateOrCreate(['name' => 'Penicilina']);
        $a2 = Allergy::updateOrCreate(['name' => 'Polvo / Ácaros']);
        
        PatientAllergy::updateOrCreate(
            ['patient_id' => $patient->id, 'allergy_id' => $a1->id],
            ['severity' => 'severe', 'notes' => 'Reacción anafiláctica previa', 'noted_at' => '2015-01-01']
        );
        PatientAllergy::updateOrCreate(
            ['patient_id' => $patient->id, 'allergy_id' => $a2->id],
            ['severity' => 'mild', 'notes' => 'Rinitis estacional', 'noted_at' => '2010-06-01']
        );

        // 3. Condiciones Crónicas
        $c1 = Condition::updateOrCreate(['name' => 'Hipertensión Arterial']);
        $c2 = Condition::updateOrCreate(['name' => 'Diabetes Tipo 2']);
        
        PatientCondition::updateOrCreate(
            ['patient_id' => $patient->id, 'condition_id' => $c1->id],
            ['diagnosed_at' => '2020-01-01', 'notes' => 'Controlado con Losartán', 'active' => true]
        );
        PatientCondition::updateOrCreate(
            ['patient_id' => $patient->id, 'condition_id' => $c2->id],
            ['diagnosed_at' => '2022-05-10', 'notes' => 'Control con Metformina', 'active' => true]
        );

        // 4. Estilo de Vida
        PatientLifestyle::updateOrCreate(
            ['patient_id' => $patient->id],
            [
                'company_id' => $company->id,
                'activity_level' => 'moderate',
                'sport' => 'Fútbol Senior',
                'dominant_side' => 'Right',
                'notes' => 'Fuma 5 cigarrillos al día. Bebe ocasionalmente los fines de semana.'
            ]
        );

        // 5. Tratamiento FINALIZADO (Historial)
        $oldTreatment = Treatment::updateOrCreate(
            ['patient_id' => $patient->id, 'company_id' => $company->id, 'doctor_id' => $doctorSport->id, 'item_id' => $itemClinic->id, 'status' => 'completed'],
            [
                'branch_id' => $sportBranch->id,
                'referral_diagnosis' => 'Lumbago Mecánico',
                'description' => 'Tratamiento preventivo por dolor lumbar crónico.',
                'total_sessions' => 5,
                'completed_sessions' => 5,
                'start_date' => Carbon::now()->subMonths(2),
                'end_date' => Carbon::now()->subMonths(1),
            ]
        );

        // 6. Tratamiento ACTUAL (En Progreso)
        $activeTreatment = Treatment::updateOrCreate(
            ['patient_id' => $patient->id, 'company_id' => $company->id, 'doctor_id' => $doctorSport->id, 'item_id' => $itemClinic->id, 'status' => 'in_progress'],
            [
                'branch_id' => $sportBranch->id,
                'referral_diagnosis' => 'Ruptura Parcial Tendón de Aquiles',
                'description' => 'Rehabilitación post-traumática ocurrida en entrenamiento.',
                'total_sessions' => 12,
                'completed_sessions' => 2,
                'start_date' => Carbon::now()->subDays(10)
            ]
        );

        // 7. Sesiones del Tratamiento Actual
        // Sesión 1: Completada
        $s1 = TreatmentSession::updateOrCreate(
            ['treatment_id' => $activeTreatment->id, 'date' => Carbon::now()->subDays(7)->toDateString()],
            [
                'company_id' => $company->id,
                'branch_id' => $sportBranch->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctorSport->id,
                'item_id' => $itemClinic->id,
                'time' => '09:00:00',
                'status' => 'completed',
                'pain_before' => 8,
                'pain_after' => 6,
                'notes' => 'Paciente presenta mucho edema. Se realiza drenaje y movilización pasiva.',
                'patient_amount_clp' => 35000,
                'doctor_amount_clp' => 12000,
                'signed_at' => Carbon::now()->subDays(7),
            ]
        );

        // Signos vitales de la S1
        VitalSign::updateOrCreate(
            ['source_type' => 'App\Models\TreatmentSession', 'source_id' => $s1->id],
            [
                'company_id' => $company->id,
                'patient_id' => $patient->id,
                'bp_systolic' => 140,
                'bp_diastolic' => 90,
                'heart_rate' => 78,
                'weight_kg' => 85.5,
                'height_cm' => 175,
                'bmi' => 27.9,
                'recorded_at' => Carbon::now()->subDays(7)
            ]
        );

        // Sesión 2: Completada
        $s2 = TreatmentSession::updateOrCreate(
            ['treatment_id' => $activeTreatment->id, 'date' => Carbon::now()->subDays(3)->toDateString()],
            [
                'company_id' => $company->id,
                'branch_id' => $sportBranch->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctorSport->id,
                'item_id' => $itemClinic->id,
                'time' => '10:30:00',
                'status' => 'completed',
                'pain_before' => 6,
                'pain_after' => 4,
                'notes' => 'Mejoría en el rango de movimiento. Se inician ejercicios de carga sutil.',
                'patient_amount_clp' => 35000,
                'doctor_amount_clp' => 12000,
                'signed_at' => Carbon::now()->subDays(3),
            ]
        );

        // Sesión 3: Para HOY
        TreatmentSession::updateOrCreate(
            ['treatment_id' => $activeTreatment->id, 'date' => Carbon::now()->toDateString()],
            [
                'company_id' => $company->id,
                'branch_id' => $sportBranch->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctorSport->id,
                'item_id' => $itemClinic->id,
                'time' => '11:00:00',
                'status' => 'scheduled',
                'patient_amount_clp' => 35000,
                'doctor_amount_clp' => 12000
            ]
        );

        $this->command->info('Ricardo Paciente Experto creado con historial clínico profundo.');
    }
}
