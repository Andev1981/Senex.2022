<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Item;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SampleLiveSystemSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('rut', '76765699-8')->first();
        $branch = Branch::where('company_id', $company->id)->first();
        $doctors = Doctor::where('company_id', $company->id)->get();
        $item = Item::where('company_id', $company->id)->first();
        $rooms = Room::where('branch_id', $branch->id)->get();

        if (!$company || !$branch || $doctors->isEmpty() || !$item) {
            $this->command->error('Faltan datos base (Empresa, Sucursal, Doctores o Items) para cargar pacientes.');
            return;
        }

        $patientsData = [
            ['name' => 'Marcela', 'last_name' => 'Rojas', 'rut' => '12.345.678-9', 'email' => 'marcela@example.com'],
            ['name' => 'Ricardo', 'last_name' => 'Lagos', 'rut' => '8.765.432-1', 'email' => 'ricardo@example.com'],
            ['name' => 'Carla', 'last_name' => 'Perez', 'rut' => '15.987.654-3', 'email' => 'carla@example.com'],
            ['name' => 'Diego', 'last_name' => 'Munoz', 'rut' => '18.123.456-k', 'email' => 'diego@example.com'],
            ['name' => 'Sofia', 'last_name' => 'Mery', 'rut' => '20.456.789-0', 'email' => 'sofia@example.com'],
        ];

        $today = Carbon::today();

        foreach ($patientsData as $index => $p) {
            $patient = Patient::create([
                'company_id' => $company->id,
                'name' => $p['name'],
                'last_name' => $p['last_name'],
                'rut' => $p['rut'],
                'email' => $p['email'],
                'phone' => '+5691111' . str_pad($index, 4, '0', STR_PAD_LEFT),
                'birth_date' => Carbon::now()->subYears(rand(20, 60)),
                'gender' => ($index % 2 == 0) ? 'female' : 'male',
            ]);

            // Crear un Tratamiento Activo
            $treatment = Treatment::create([
                'company_id' => $company->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctors[$index % $doctors->count()]->id,
                'item_id' => $item->id,
                'diagnostic_code' => 'M54.5', // Lumbalgia como ejemplo
                'description' => 'Rehabilitación Kinesiológica post-esfuerzo',
                'total_sessions' => 10,
                'completed_sessions' => 3,
                'status' => \App\Enums\TreatmentStatusEnum::IN_PROGRESS,
                'start_date' => $today->copy()->subDays(15),
            ]);

            // 🎯 ASIGNACIÓN EXPLÍCITA: Vincular paciente al doctor para visibilidad
            \App\Models\DoctorPatientAssignment::create([
                'company_id' => $company->id,
                'branch_id'  => $branch->id,
                'patient_id' => $patient->id,
                'doctor_id'  => $treatment->doctor_id,
                'role'       => 'therapist',
                'is_own_patient' => ($index % 2 == 0), // Algunos propios, algunos de clínica
                'started_at' => now(),
            ]);

            // Sesiones Pasadas (Evolución)
            for ($i = 1; $i <= 3; $i++) {
                $sessionPrice = (int)($item->price ?? 25000);
                $doctorComm = (int)($item->serviceDetail?->default_doctor_commission_clp ?? ($sessionPrice / 2));
                
                TreatmentSession::create([
                    'company_id' => $company->id,
                    'patient_id' => $patient->id,
                    'doctor_id' => $treatment->doctor_id,
                    'treatment_id' => $treatment->id,
                    'item_id' => $item->id,
                    'branch_id' => $branch->id,
                    'date' => $today->copy()->subDays(15 - ($i * 3)),
                    'time' => '10:00',
                    'status' => \App\Enums\AppointmentStatusEnum::COMPLETED,
                    'pain_before' => 8 - $i,
                    'pain_after' => 6 - $i,
                    'subjective' => 'Paciente refiere mejoría gradual.',
                    'objective' => 'Rango articular aumentado en 10 grados.',
                    'assessment' => 'Evolución favorable.',
                    'plan' => 'Continuar con ejercicios de carga.',
                    'patient_amount_clp' => $sessionPrice,
                    'doctor_amount_clp' => $doctorComm,
                    'clinic_amount_clp' => $sessionPrice - $doctorComm,
                ]);
            }

            // Cita para HOY (Agendada)
            $startHour = 9 + $index;
            Appointment::create([
                'company_id' => $company->id,
                'patient_id' => $patient->id,
                'doctor_id' => $treatment->doctor_id,
                'item_id' => $item->id,
                'branch_id' => $branch->id,
                'room_id' => $rooms->count() > 0 ? $rooms[$index % $rooms->count()]->id : null,
                'start_at' => $today->copy()->setTime($startHour, 0),
                'end_at' => $today->copy()->setTime($startHour + 1, 0),
                'status' => \App\Enums\AppointmentStatusEnum::SCHEDULED,
                'modality' => 'onsite',
            ]);

            // Cita para MAÑANA
            Appointment::create([
                'company_id' => $company->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctors[($index + 1) % $doctors->count()]->id,
                'item_id' => $item->id,
                'branch_id' => $branch->id,
                'room_id' => $rooms->count() > 0 ? $rooms[($index + 1) % $rooms->count()]->id : null,
                'start_at' => $today->copy()->addDay()->setTime(11, 0),
                'end_at' => $today->copy()->addDay()->setTime(12, 0),
                'status' => 'scheduled', // 'confirmed' no existe en el enum de la migración
                'modality' => 'onsite',
            ]);
        }
    }
}
