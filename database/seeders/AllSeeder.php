<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use App\Models\SessionType;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log; 

class AllSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CONFIGURACIÓN INICIAL
        $this->call(EmergencyAdminSeeder::class);
        
        $this->command->info('Creating Roles...');
        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'kine']);
        Role::firstOrCreate(['name' => 'patient']);

        $this->call([
            RegionsTableSeeder::class,
            ProvincesTableSeeder::class,
            CommunesTableSeeder::class,
            DiagnosticSeeder::class,
            SaaSPlanSeeder::class,
        ]);

        $this->command->info('Creating Companies...');
        
        $company1 = Company::create(['rut' => '11111111-1', 'business_name' => 'Senex Centro', 'email' => 'senex@demo.com']);
        $company2 = Company::create(['rut' => '22222222-2', 'business_name' => 'Senex Sport', 'email' => 'sport@demo.com']);

        $this->command->info('Seeding Senex Centro...');
        $this->seedTenantData($company1);

        $this->command->info('Seeding Senex Sport...');
        $this->seedTenantData($company2);
    }

    private function seedTenantData(Company $company)
    {
        Log::info("--- Sembrando Tenant: {$company->business_name} ---");

        // A. SUCURSALES (Verificar o Crear)
        Log::info("Company Branches: ". $company->branches()->pluck('id'));
        $branchIds = $company->branches()->pluck('id');
        if ($branchIds->isEmpty()) {
             $branches = Branch::factory(2)->create(['company_id' => $company->id]);
             $branchIds = $branches->pluck('id');
             Log::info("Primer if en branch");
        }

        Log::info("Saliendo de crear Branch");

        // B. USUARIOS BASE (Corrección: Envío directo)
        $this->call(UserSeeder::class, false, ['company' => $company, 'branches' => $branchIds]);

        // C. SESSION TYPES (Creación en Memoria)
        Log::info("Creando Tipos de Sesión en memoria...");
        $typesData = [
            ['name' => 'Kinesiología General', 'code' => 'KINE-GEN', 'category' => 'kinesiology', 'duration_minutes' => 60, 'base_price_clp' => 25000, 'default_doctor_commission_clp' => 12000, 'is_active' => true, 'is_exempt' => true],
            ['name' => 'Kinesiología Respiratoria', 'code' => 'KINE-RESP', 'category' => 'kinesiology', 'duration_minutes' => 45, 'base_price_clp' => 30000, 'default_doctor_commission_clp' => 15000, 'is_active' => true, 'is_exempt' => true],
            ['name' => 'Rehabilitación Deportiva', 'code' => 'KINE-SPORT', 'category' => 'kinesiology', 'duration_minutes' => 60, 'base_price_clp' => 35000, 'default_doctor_commission_clp' => 17000, 'is_active' => true, 'is_exempt' => true],
            ['name' => 'Evaluación Inicial', 'code' => 'KINE-EVAL', 'category' => 'evaluation', 'duration_minutes' => 45, 'base_price_clp' => 40000, 'default_doctor_commission_clp' => 20000, 'is_active' => true, 'is_exempt' => true],
        ];
         Log::info("Tipos de Sesión creados...");

        $sessionTypes = collect();
         Log::info("Tipos de Sesión collect...");
        foreach ($typesData as $data) {
            $data['company_id'] = $company->id;
            $sessionTypes->push(SessionType::create($data));
        }

         Log::info("Saliendo de foreach...");

        // D. OTROS SEEDERS (Corrección: Envío directo, sin 'parameters')
        $this->call(InsuranceSeeder::class, false, ['company' => $company]);
        
        // ¡OJO AQUÍ! Tenías ['parameters' => ...] en AgreementSeeder, eso causaba error
        $this->call(AgreementSeeder::class, false, ['company' => $company]); 
        
        // E. DATOS MASIVOS
        $this->seedMassiveData($company, $branchIds, $sessionTypes);
    }

    private function seedMassiveData(Company $company, $branchIds, $sessionTypes)
    {
        Log::warning("Generando data masiva para {$company->business_name}...");

        // 1. Doctores
        $doctors = Doctor::factory()->count(5)->create([
            'company_id' => $company->id,
            'user_id' => User::factory()->state(['company_id' => $company->id])
        ]);
        $doctors->each(fn($d) => $d->user->assignRole('kine'));

        // 2. Pacientes
        $patients = Patient::factory()->count(50)->create([
            'company_id' => $company->id,
            'user_id' => User::factory()->state(['company_id' => $company->id])
        ]);
        $patients->each(fn($p) => $p->user->assignRole('patient'));
      
        // 3. Llamada al Seeder Final
        if ($sessionTypes->isNotEmpty()) {
            $this->call(TreatmentSessionSeeder::class, false, [
                'company' => $company, 
                'branches' => $branchIds,
                'doctors' => $doctors, 
                'patients' => $patients, 
                'sessionTypes' => $sessionTypes
            ]);
        }
    }
}