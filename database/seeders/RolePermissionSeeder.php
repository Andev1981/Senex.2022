<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'posts.view',
            'posts.create',
            'posts.edit',
            'posts.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles y asignar permisos
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $editorRole = Role::create(['name' => 'editor']);
        $editorRole->givePermissionTo([
            'posts.view',
            'posts.create',
            'posts.edit',
        ]);

        $userRole = Role::create(['name' => 'user']);
        $userRole->givePermissionTo(['posts.view']);

        // Asignar rol admin al primer usuario
        $admin = User::first();
        if ($admin) {
            $admin->assignRole('admin');
        }
    }
}