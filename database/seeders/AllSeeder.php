<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\TreatmentSession;
use App\Models\User;
use App\Models\Treatment;
use App\Models\SessionType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Spatie\Permission\Models\Role;

class AllSeeder extends Seeder
{
    public function run(): void
    {
        // Hotfix: Asegurar que user_id existe en patients si la migración falló
        if (Schema::hasTable('patients') && !Schema::hasColumn('patients', 'user_id')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade')->after('id');
            });
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        $this->command->info('Truncating all tables...');
        $tables = DB::select('SHOW TABLES');

        foreach ($tables as $table) {
            $tableArray = (array) $table;
            $tableName = reset($tableArray);
            
            // Evitar truncar la tabla de migraciones
            if ($tableName !== config('database.migrations')) {
                DB::table($tableName)->truncate();
            }
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('All tables truncated!');

        $this->call(EmergencyAdminSeeder::class);
        $this->command->info('Creating Roles...');
        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'kine']);
        Role::firstOrCreate(['name' => 'patient']);

        $this->call(RegionsTableSeeder::class);
        $this->call(ProvincesTableSeeder::class);
        $this->call(CommunesTableSeeder::class);
        $this->call(DiagnosticSeeder::class);
        $this->call(SaaSPlanSeeder::class);

        $this->command->info('Creating Companies and Branches...');
        
        $company1 = Company::create(['rut' => '11111111-1', 'business_name' => 'Senex Centro', 'email' => 'senex@demo.com']);
        $company2 = Company::create(['rut' => '22222222-2', 'business_name' => 'Senex Sport', 'email' => 'sport@demo.com']);

        $this->command->info('Seeding data for Senex Centro...');
        $this->seedTenantData($company1);

        $this->command->info('Seeding data for Senex Sport...');
        $this->seedTenantData($company2);
    }

    private function seedTenantData(Company $company)
    {
        $branchIds = $company->branches()->pluck('id');

        $this->call(CompanySeeder::class, false, ['parameters' => ['company' => $company, 'branches' => $branchIds]]);
        $this->call(SessionTypeSeeder::class, false, ['parameters' => ['company' => $company]]);
        $this->call(InsuranceSeeder::class, false, ['parameters' => ['company' => $company]]);
        $this->call(AgreementSeeder::class, false, ['parameters' => ['company' => $company]]);
        $this->call(TreatmentSessionSeeder::class, false, ['parameters' => ['company' => $company, 'branches' => $branchIds]]);
        
        /* $this->seedMassiveData($company, $branchIds); */
    }

    private function seedMassiveData(Company $company, $branchIds)
    {
        $this->command->info("Generating massive data for {$company->business_name}...");

        // A) Create 5 Kinesiólogos
        $doctors = Doctor::factory()->count(5)->create([
            'company_id' => $company->id,
            'user_id' => User::factory()->state(['company_id' => $company->id])
        ]);
        
        $doctors->each(function ($doctor) {
            $doctor->user->assignRole('kine');
        });

        // B) Create 50 Patients
        $patients = Patient::factory()->count(50)->create([
            'company_id' => $company->id,
            'user_id' => User::factory()->state(['company_id' => $company->id])
        ]);
        
        $patients->each(function ($patient) {
            $patient->user->assignRole('patient');
        });

        // C) Generate 300 Sessions (And their parent Treatments)
        
        // Obtenemos los tipos de sesión disponibles para esta empresa
        $sessionTypeIds = SessionType::where('company_id', $company->id)->pluck('id');

        if ($sessionTypeIds->isEmpty()) {
            $this->command->warn("No SessionTypes found for company {$company->id}. Skipping sessions.");
            return;
        }

        TreatmentSession::factory()->count(100)->make([
            'company_id' => $company->id,
        ])->each(function ($session) use ($branchIds, $doctors, $patients, $company, $sessionTypeIds) {
            
            // 1. Seleccionar datos aleatorios para mantener coherencia
            $branchId = $branchIds->random();
            $doctorId = $doctors->random()->id;
            $patientId = $patients->random()->id;
            $sessionTypeId = $sessionTypeIds->random();

            // 2. CRÍTICO: Crear el Tratamiento Padre primero
            // Esto soluciona el error 'Field treatment_id doesn't have a default value'
            $treatment = Treatment::create([
                'company_id' => $company->id,
                'branch_id' => $branchId,
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
                'session_type_id' => $sessionTypeId,
                'status' => 'in_progress', // O aleatorio si prefieres
                'start_date' => now(),
            ]);

            // 3. Asignar datos a la sesión
            $session->branch_id = $branchId;
            $session->doctor_id = $doctorId;
            $session->patient_id = $patientId;
            $session->session_type_id = $sessionTypeId;
            $session->treatment_id = $treatment->id; // <--- Aquí vinculamos al padre

            // 4. Lógica de fechas (60% pasado, 40% futuro)
            $isPast = rand(1, 100) <= 60;
            $session->date = $isPast 
                ? now()->subDays(rand(1, 60)) 
                : now()->addDays(rand(1, 30));
            
            $session->save();
        });
        
        $this->command->info("Massive data generated: 5 Kines, 50 Patients, 300 Sessions created successfully.");
    }
}
