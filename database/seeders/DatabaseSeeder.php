<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Branch;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CONFIGURACIÓN INICIAL (Base)
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
        

        // --- COMPANY 2 (USER: VERIFICA ESTOS DATOS) ---
        // Al crear la Company, se crea una Branch automática (Sucursal Principal).
        $company2 = Company::firstOrCreate(
            ['id' => 2], 
            // !!! INGRESA AQUÍ TUS DATOS REALES !!!
            ['rut' => '76765699-8', 'business_name' => 'Senex SPA', 'email' => 'senex@senex.cl']
        );

        $this->command->info('Configuring Branches...');

        // Manejar Branch para Company 2 (Evitar duplicados con la automática)
        $branch2 = Branch::find(2);
        $branch3 = Branch::find(3);

        if (!$branch2) {
            // Buscamos la sucursal principal automática de la compañia 2
            $branch2 = Branch::where('company_id', 2)->where('is_main', true)->first();
        }

        if ($branch2) {
            $this->command->info("Actualizando Branch existente (ID: {$branch2->id}) para Company 2...");
            
            $branch2->update([
                // !!! INGRESA AQUÍ EL NOMBRE REAL DE TU SUCURSAL !!!
                'name' => 'Senex', 
                'company_id' => 2,
                // !!! VERIFICA ESTOS DATOS !!!
                'codigo_sucursal_sii' => '2', 
                'email' => 'senex@senex.cl',        
                'is_main' => true,
                'active' => true,
            ]);

            // Forzar ID 2 si es necesario para el seeder de pacientes
            if ($branch2->id != 2 && !Branch::find(2)) {
                $branch2->id = 2;
                $branch2->save();
                $this->command->info("Branch ID movido a 2.");
            }
        } else {
            $this->command->info("Creando Branch 2 desde cero...");
            Branch::create([
                'id' => 2,
                'company_id' => 2,
                'name' => 'Senex', // !!! NOMBRE REAL !!!
                'codigo_sucursal_sii' => '2',
                'email' => 'senex@senex.cl',
                'is_main' => true,
                'active' => true,
            ]);
        }

        if ($branch3) {
            $this->command->info("Actualizando Branch existente (ID: {$branch3->id}) para Company 2...");
            
            $branch3->update([
                // !!! INGRESA AQUÍ EL NOMBRE REAL DE TU SUCURSAL !!!
                'name' => 'Senex Sport', 
                'company_id' => 2,
                // !!! VERIFICA ESTOS DATOS !!!
                'codigo_sucursal_sii' => '3', 
                'email' => 'senexsport@senex.cl',        
                'is_main' => false,
                'active' => true,
            ]);

            // Forzar ID 2 si es necesario para el seeder de pacientes
            if ($branch3->id != 3 && !Branch::find(3)) {
                $branch3->id = 3;
                $branch3->save();
                $this->command->info("Branch ID movido a 3.");
            }
        } else {
            $this->command->info("Creando Branch 3 desde cero...");
            Branch::create([
                'id' => 3,
                'company_id' => 2,
                'name' => 'Senex Sport', // !!! NOMBRE REAL !!!
                'codigo_sucursal_sii' => '3',
                'email' => 'senexsport@senex.cl',
                'is_main' => false,
                'active' => true,
            ]);
        }

        $this->command->info('Running Migrated Patients Seeder...');
        $this->call(MigratedPatientsSeeder::class);
        $this->call(DoctorsSeeder::class);
    }
}