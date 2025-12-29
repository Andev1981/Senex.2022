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
        $company = Company::first();
        if (!$company) {
            $company = Company::create([
                'rut' => '76387221-1',
                'business_name' => 'Move Informatica',
                'giro' => 'Software',
                'email' => 'contacto@move.cl',
                'phone' => '123456789'
            ]);
        }

        $user = User::updateOrCreate(
            ['email' => 'javt1981@gmail.com'],
            [
                'name' => 'Juan Andres',
                'password' => Hash::make('Juan1981'),
                'company_id' => $company->id
            ]
        );

        $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $user->assignRole($role);
    }
}
