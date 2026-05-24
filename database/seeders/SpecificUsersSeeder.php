<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Company;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SpecificUsersSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('business_name', 'Senex SPA')->first();
        if (!$company) {
            $company = Company::first(); // Fallback
        }
        
        $branch = $company ? $company->branches()->first() : null;

        if (!$company || !$branch) {
            $this->command->error('No se encontró empresa o sucursal para vincular usuarios.');
            return;
        }

        // 1. Admin: Jorge Salum
        $this->command->info('Configurando Admin: Jorge Salum...');
        $admin = User::updateOrCreate(
            ['email' => 'jorge.salum@senex.cl'],
            [
                'name' => 'Jorge Salum',
                'password' => Hash::make('Senex2026#'),
                'company_id' => $company->id,
                'is_active' => true
            ]
        );
        $admin->syncRoles(['admin']);
        $admin->branches()->sync([$branch->id]);

        // 2. Kines
        $kines = [
            ['name' => 'Yanina', 'last_name' => 'Jadue', 'email' => 'yanina.jadue@senex.cl'],
            ['name' => 'Katyna', 'last_name' => 'Cardenas', 'email' => 'katyna.cardenas@senex.cl'],
            ['name' => 'Gonzalo', 'last_name' => 'Jadue', 'email' => 'gonzalo.jadue@senex.cl'],
        ];

        foreach ($kines as $kineData) {
            $this->command->info("Configurando Kine: {$kineData['name']} {$kineData['last_name']}...");
            $user = User::updateOrCreate(
                ['email' => $kineData['email']],
                [
                    'name' => $kineData['name'] . ' ' . $kineData['last_name'],
                    'password' => Hash::make('Senex2026#'),
                    'company_id' => $company->id,
                    'is_active' => true
                ]
            );
            $user->syncRoles(['kine']);
            $user->branches()->sync([$branch->id]);

            // Crear modelo Doctor asociado para el flujo clínico
            $doctor = Doctor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_id' => $company->id,
                    'name' => $kineData['name'],
                    'last_name' => $kineData['last_name'],
                    'email' => $kineData['email'],
                    'rut' => 'RUT-' . strtoupper(substr(md5($kineData['email']), 0, 8)),
                    'is_active' => true,
                ]
            );

            // 🎯 Vincular Doctor con la sucursal y habilitar acceso móvil
            $doctor->branches()->sync([
                $branch->id => [
                    'status' => 'active',
                    'mobile_app_access' => true,
                    'status_changed_at' => now(),
                ]
            ]);
        }

        // 3. Cajero: Recepción Chesterton
        $this->command->info('Configurando Cajero: Recepción Chesterton...');
        $cajero = User::updateOrCreate(
            ['email' => 'recepcion.chesterton@senex.cl'],
            [
                'name' => 'Recepción Chesterton',
                'password' => Hash::make('Senex2026#'),
                'company_id' => $company->id,
                'is_active' => true
            ]
        );
        Role::firstOrCreate(['name' => 'cajero']);
        $cajero->syncRoles(['cajero']);
        $cajero->branches()->sync([$branch->id]);

        $this->command->info('Usuarios específicos configurados exitosamente.');
    }
}
