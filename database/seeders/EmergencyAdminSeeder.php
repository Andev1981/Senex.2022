<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Company;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class EmergencyAdminSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('rut', '76765699-8')->first();
        if (!$company) {
            $company = Company::create([
                'rut' => '76765699-8',
                'business_name' => 'Senex SPA',
                'business_type' => 'clinical',
                'giro' => 'Servicios de Kinesiología',
                'email' => 'senex@senex.cl',
                'phone' => '+56900000000'
            ]);
        }

        $user = User::updateOrCreate(
            ['email' => 'javt1981@gmail.com'],
            [
                'name' => 'Juan Andres',
                'password' => Hash::make('Juan1981#'),
                'company_id' => $company->id
            ]
        );

        $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $user->assignRole($role);

        // Crear sucursal base para evitar nulos en pruebas
        if ($company->branches()->count() === 0) {
            $company->branches()->create([
                'name' => 'Sucursal Principal',
                'codigo_sucursal_sii' => '0',
                'is_main' => true,
                'active' => true,
                'schedule' => [
                    'MO' => ['open' => '08:00', 'close' => '20:00'],
                    'TU' => ['open' => '08:00', 'close' => '20:00'],
                    'WE' => ['open' => '08:00', 'close' => '20:00'],
                    'TH' => ['open' => '08:00', 'close' => '20:00'],
                    'FR' => ['open' => '08:00', 'close' => '20:00'],
                    'SA' => ['open' => '09:00', 'close' => '14:00'],
                ]
            ]);
        }
    }
}
