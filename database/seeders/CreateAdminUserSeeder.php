<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Comuna;
use App\Models\Country;
use App\Models\Region;
use Illuminate\Database\Seeder;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       

        $address = Address::create([
            'street' => 'Calle prueba',
            'number' => 2364,
            'address' => 'Pasaje las pruebas #2023',
            'latitude' => null,
            'longitude' => null,
            'comuna_id' => 1,

        ]);
        //#1
        $user = User::create([
            'name' => 'Juan Andres',
            'last_name' => 'Vergara Tapia',
            'email' => 'javt1981@gmail.com',
            'password' => bcrypt('Juan1981'),
            'avatar' => '',
            'rut' => '',
            'birth' => null,
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Super-Administrador'
        ]);

        $role = Role::create(['name' => 'super-admin']);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#2
        $user = User::create([
            'name' => 'Mónica',
            'last_name' => 'Fagres',
            'email' => 'mfagres@gmail.com',
            'password' => bcrypt('9006'),
            'avatar' => '',
            'rut' => '',
            'birth' => null,
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Administrador'
        ]);

        $permissions = Permission::pluck('id','id')->all();

        $role = Role::create(['name' => 'admin']);

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#1
        $user = User::create([
            'name' => 'Marco',
            'last_name' => 'Jadue',
            'email' => 'bravitos4j@hotmail.com',
            'password' => bcrypt('9006'),
            'avatar' => '',
            'rut' => '',
            'birth' => null,
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Administrador'
        ]);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);
         //#2

         $user1 = User::create([ 
            'name' => 'Paciente',
            'last_name' => 'Apellido',
            'email' => 'paciente@email.cl',
            'password' => bcrypt('Juan1981'),
            'avatar' => '',
            'rut' => '',
            'birth' => null,
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
         ]);

        $role = Role::create(['name' => 'patient']);

        $user1->assignRole([$role->id]);



        $user2 = User::create([ 
            'name' => 'Doctor',
            'last_name' => 'Apellido',
            'email' => 'doctor@email.cl',
            'password' => bcrypt('Juan1981'),
            'avatar' => '',
            'rut' => '',
            'birth' => null,
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Doctor'
         ]);

        $role = Role::create(['name' => 'doctor']);

        $user2->assignRole([$role->id]);

    }
}
