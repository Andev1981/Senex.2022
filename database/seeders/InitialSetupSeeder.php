<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Branch;
use App\Models\User;
use Spatie\Permission\Models\Role;

class InitialSetupSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Iniciando carga de datos maestros y configuracion de usuario...');

        // 1. Admin de Emergencia (Crea empresa ID 1 y usuario)
        $this->call(EmergencyAdminSeeder::class);
        
        // 2. Roles y Permisos
        $this->command->info('Configurando Roles y Permisos...');
        $this->call(PermissionSeeder::class);
        
        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'kine']);
        Role::firstOrCreate(['name' => 'patient']);

        // 3. Geografía y Datos Base
        $this->call([
            RegionsTableSeeder::class,
            ProvincesTableSeeder::class,
            CommunesTableSeeder::class,
            DiagnosticSeeder::class,
            SaaSPlanSeeder::class,
        ]);

        // 4. Empresa Principal (Senex SPA)
        $this->command->info('Configurando Empresa Senex SPA...');
        
        $company = Company::updateOrCreate(
            ['rut' => '76765699-8'],
            [
                'business_name' => 'Senex SPA',
                'business_type' => 'clinical',
                'giro' => 'Servicios de Kinesiología',
                'email' => 'senex@senex.cl',
                'phone' => '+56900000000'
            ]
        );

        // 5. Configuración de Sucursales (Solo 2: Sport y Domicilio)
        $this->command->info('Configurando Sucursales (Sport y Domicilio)...');

        $mainBranch = $company->branches()->where('is_main', true)->first();
        
        if ($mainBranch) {
            $mainBranch->update([
                'name' => 'Senex Sport',
                'codigo_sucursal_sii' => '3',
                'email' => 'senexsport@senex.cl',
                'is_main' => true,
                'is_home_care_only' => false,
                'active' => true,
            ]);
            $this->command->info('Sucursal principal: Senex Sport');
        }

        $secondBranch = Branch::updateOrCreate(
            ['company_id' => $company->id, 'name' => 'Senex Domicilio'],
            [
                'codigo_sucursal_sii' => '2',
                'email' => 'senex@senex.cl',
                'phone' => '+56900000000',
                'is_main' => false,
                'is_home_care_only' => true,
                'active' => true,
            ]
        );
        $this->command->info('Segunda sucursal: Senex Domicilio');

        // Limpieza de sucursales extra
        $company->branches()
            ->whereNotIn('id', [$mainBranch->id, $secondBranch->id])
            ->delete();

        // 6. Vinculación del Usuario Admin a Senex SPA
        $this->command->info('Configurando usuarios administrativos...');
        
        // Superadmin (Juan)
        $user = User::where('email', 'javt1981@gmail.com')->first();
        if ($user) {
            $user->update(['company_id' => $company->id]);
            $branches = Branch::where('company_id', $company->id)->pluck('id');
            $user->branches()->sync($branches);
            $this->command->info('Usuario javt1981@gmail.com vinculado exitosamente.');
        }

        // Admin: Mónica Fagres
        $monica = User::updateOrCreate(
            ['email' => 'mfagres@gmail.com'],
            [
                'name' => 'Mónica Fagres',
                'password' => \Illuminate\Support\Facades\Hash::make('senex2026'),
                'company_id' => $company->id
            ]
        );
        $monica->assignRole('admin');
        $monica->branches()->sync([$secondBranch->id]); // Senex Domicilio

        // Admin: Marco Jadue
        $marco = User::updateOrCreate(
            ['email' => 'bravitos4j@hotmail.com'],
            [
                'name' => 'Marco Jadue',
                'password' => \Illuminate\Support\Facades\Hash::make('senex2026'),
                'company_id' => $company->id
            ]
        );
        $marco->assignRole('admin');
        $marco->branches()->sync([$secondBranch->id]); // Senex Domicilio

        // Admin Genérico: Senex Sport
        $adminSport = User::updateOrCreate(
            ['email' => 'admin.sport@senex.cl'],
            [
                'name' => 'Administrador Sport',
                'password' => \Illuminate\Support\Facades\Hash::make('senex2026'),
                'company_id' => $company->id
            ]
        );
        $adminSport->assignRole('admin');
        $adminSport->branches()->sync([$mainBranch->id]); // Senex Sport

        $this->command->info('Usuarios administrativos configurados.');

        // 7. Previsiones
        $this->command->info('Cargando previsiones...');
        $this->call(InsuranceSeeder::class, false, ['company' => $company]);

        $this->command->info('¡Proceso completado con exito!');
    }
}
