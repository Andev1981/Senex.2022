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

        // 5. Configuración de Sucursal Única (Senex Sport)
        $this->command->info('Configurando Sucursal Única (Senex Sport)...');

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
            $this->command->info('Sucursal principal configurada.');
        }

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

        // 6. Vinculación de Usuarios
        $this->command->info('Configurando usuarios y profesionales...');
        
        // Superadmin (Juan)
        $user = User::where('email', 'javt1981@gmail.com')->first();
        if ($user) {
            $user->update(['company_id' => $company->id]);
            $user->branches()->sync([$mainBranch->id]);
            $this->command->info('Usuario javt1981@gmail.com vinculado.');
        }

        // Crear Kinesiólogos de prueba
        $kine1 = User::updateOrCreate(
            ['email' => 'kine1@senex.cl'],
            [
                'name' => 'Pedro Kinesiologo',
                'password' => \Illuminate\Support\Facades\Hash::make('senex2026'),
                'company_id' => $company->id
            ]
        );
        $kine1->assignRole('kine');
        $kine1->branches()->sync([$mainBranch->id]);
        
        $doctor1 = \App\Models\Doctor::updateOrCreate(
            ['user_id' => $kine1->id],
            [
                'company_id' => $company->id,
                'name' => 'Pedro',
                'last_name' => 'Kinesiologo',
                'rut' => '11111111-1',
                'speciality' => 'Deportiva',
                'is_active' => true
            ]
        );
        // 🎯 VINCULAR DOCTOR A SUCURSAL (Tabla branch_doctor)
        $doctor1->branches()->sync([$mainBranch->id => ['status' => 'active', 'mobile_app_access' => true]]);

        // Crear Pacientes de prueba
        $this->command->info('Creando pacientes de prueba...');
        \App\Models\Patient::updateOrCreate(
            ['rut' => '22222222-2'],
            [
                'company_id' => $company->id,
                'name' => 'Juan',
                'last_name' => 'Pérez',
                'email' => 'juan.perez@email.com',
                'phone' => '+56911111111',
                'gender' => 'male',
                'birth_date' => '1990-05-15'
            ]
        );

        \App\Models\Patient::updateOrCreate(
            ['rut' => '33333333-3'],
            [
                'company_id' => $company->id,
                'name' => 'María',
                'last_name' => 'González',
                'email' => 'maria.g@email.com',
                'phone' => '+56922222222',
                'gender' => 'female',
                'birth_date' => '1985-10-20'
            ]
        );

        $this->command->info('Usuarios, Kines y Pacientes configurados.');

        // 7. Previsiones
        $this->command->info('Cargando previsiones...');
        $this->call(InsuranceSeeder::class, false, ['company' => $company]);

        $this->command->info('¡Proceso completado con exito!');
    }
}
