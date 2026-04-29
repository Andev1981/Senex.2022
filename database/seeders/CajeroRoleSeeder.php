<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CajeroRoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear el rol si no existe
        $role = Role::firstOrCreate(['name' => 'cajero', 'guard_name' => 'web']);

        // 2. Definir permisos para el cajero
        $permissions = [
            'payments.index',
            'payments.process',
            'payments.pdf',
            'patients.index',
            'patients.view',
            'patients.create',
        ];

        // Asegurarse de que los permisos existan
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 3. Sincronizar permisos al rol
        $role->syncPermissions($permissions);

        // 4. Crear un usuario de prueba si no existe
        $user = User::where('email', 'caja@senex.cl')->first();
        if (!$user) {
            $company = \App\Models\Company::first();
            $user = User::create([
                'name' => 'Cajero de Prueba',
                'email' => 'caja@senex.cl',
                'password' => Hash::make('senex2026'),
                'is_active' => true,
                'company_id' => $company ? $company->id : 1,
            ]);
        }

        $user->assignRole($role);
    }
}
