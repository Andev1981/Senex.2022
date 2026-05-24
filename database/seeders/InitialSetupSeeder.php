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
            CommunesTableSeeder::class,
            DiagnosticSeeder::class,
            // SaaSPlanSeeder::class, // Omitido por solicitud del usuario
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

        // 5. Configuración de Sucursal Única (Chesterton)
        $this->command->info('Configurando Sucursal Única (Chesterton)...');

        $mainBranch = $company->branches()->where('is_main', true)->first();
        
        $defaultSchedule = [
            'MO' => ['open' => '08:00', 'close' => '20:00'],
            'TU' => ['open' => '08:00', 'close' => '20:00'],
            'WE' => ['open' => '08:00', 'close' => '20:00'],
            'TH' => ['open' => '08:00', 'close' => '20:00'],
            'FR' => ['open' => '08:00', 'close' => '20:00'],
            'SA' => ['open' => '09:00', 'close' => '14:00'],
            // SU: Domingo cerrado por defecto
        ];

        if (!$mainBranch) {
            $mainBranch = $company->branches()->create([
                'name' => 'Chesterton',
                'codigo_sucursal_sii' => '0',
                'is_main' => true,
                'active' => true,
                'email' => 'chesterton@senex.cl',
                'allows_onsite' => true,
                'allows_home' => false,
                'allows_online' => false,
                'schedule' => $defaultSchedule,
            ]);
        } else {
            $mainBranch->update([
                'name' => 'Chesterton',
                'codigo_sucursal_sii' => '0',
                'email' => 'chesterton@senex.cl',
                'is_main' => true,
                'allows_onsite' => true,
                'allows_home' => false,
                'allows_online' => false,
                'active' => true,
                'schedule' => $defaultSchedule,
            ]);
        }
        $this->command->info('Sucursal principal Chesterton configurada.');

        // Limpieza de sucursales extra (Aseguramos solo UNA sucursal)
        $company->branches()->where('id', '!=', $mainBranch->id)->delete();

        // 5.1 Crear Boxes (Rooms)
        $this->command->info('Creando Boxes para la sucursal...');
        \App\Models\Room::updateOrCreate(
            ['branch_id' => $mainBranch->id, 'name' => 'Box 1'],
            ['company_id' => $company->id, 'capacity' => 2, 'status' => 'active']
        );
        \App\Models\Room::updateOrCreate(
            ['branch_id' => $mainBranch->id, 'name' => 'Box 2'],
            ['company_id' => $company->id, 'capacity' => 1, 'status' => 'active']
        );
        \App\Models\Room::updateOrCreate(
            ['branch_id' => $mainBranch->id, 'name' => 'Sala de Máquinas'],
            ['company_id' => $company->id, 'capacity' => 5, 'status' => 'active']
        );

        // 5.2 Cargar Categorías y Catálogo (Servicios y Productos)
        $this->command->info('Cargando catálogo de servicios y productos...');
        $this->call([
            CategorizationProtocolSeeder::class,
            MedicalItemsProtocolSeeder::class
        ]);

        // 6. Vinculación de Usuarios (Superadmin y Usuarios Específicos)
        $this->command->info('Configurando usuarios operativos...');
        
        // Superadmin (Juan)
        $user = User::where('email', 'javt1981@gmail.com')->first();
        if ($user) {
            $user->update(['company_id' => $company->id]);
            $user->branches()->sync([$mainBranch->id]);
            $this->command->info('Usuario javt1981@gmail.com vinculado.');
        }

        // Cargar Usuarios Específicos (Admin Jorge y Kines)
        $this->call(SpecificUsersSeeder::class);

        $this->command->info('Usuarios configurados.');

        // 7. Previsiones
        $this->command->info('Cargando previsiones...');
        $this->call(InsuranceSeeder::class, false, ['company' => $company]);

        $this->command->info('Cargando disponibilidades por defecto...');
        $this->call(DefaultAvailabilitySeeder::class);

        $this->command->info('¡Proceso completado con exito!');
    }
}
