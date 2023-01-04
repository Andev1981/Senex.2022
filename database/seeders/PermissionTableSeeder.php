<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {


         Permission::create(['name' =>  'role-list', 'description' =>'Listar roles']);
         Permission::create(['name' =>  'role-create', 'description' =>'Crear nuevo rol']);
         Permission::create(['name' =>  'role-edit', 'description' =>'Editar rol']);
         Permission::create(['name' =>  'role-delete', 'description' =>'Eliminar rol']);

         Permission::create(['name' =>  'user-list', 'description' =>'Listar usuarios']);
         Permission::create(['name' =>  'user-create', 'description' =>'Crear nuevo usuario']);
         Permission::create(['name' =>  'user-edit', 'description' =>'Editar usuario']);
         Permission::create(['name' =>  'user-delete', 'description' =>'Eliminar usuario']);

         


    }
}
