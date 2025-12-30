<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class AllSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}
