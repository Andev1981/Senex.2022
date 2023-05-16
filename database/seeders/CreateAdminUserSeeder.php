<?php

namespace Database\Seeders;


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
        //#1
        $user = User::create([
            'name' => 'Juan Andres',
            'email' => 'javt1981@gmail.com',
            'password' => bcrypt('Juan1981'),
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'phone' => '+569 12345637',
            'direccion' => 'Direccion de calle #123',
            'comuna' => 'Las Condes',
            'state' => 1,
        ]);

        $role = Role::create(['name' => 'super-admin']);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#2
        $user = User::create([
            'name' => 'Mónica Fagres',
            'email' => 'mfagres@gmail.com',
            'password' => bcrypt('9006'),
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'phone' => '+569 12345637',
            'direccion' => 'Direccion de calle #123',
            'comuna' => 'Las Condes',
            'state' => 1,
        ]);

        $permissions = Permission::pluck('id','id')->all();

        $role = Role::create(['name' => 'admin']);

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#1
        $user = User::create([
            'name' => 'Marco Jadue',
            'email' => 'bravitos4j@hotmail.com',
            'password' => bcrypt('9006'),
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'phone' => '+569 12345637',
            'direccion' => 'Direccion de calle #123',
            'comuna' => 'Las Condes',
            'state' => 1,
        ]);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);
         //#2

         $user1 = User::create([ 
            'name' => 'Nombre Paciente',
            'email' => 'paciente@email.cl',
            'password' => bcrypt('Juan1981'),
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'phone' => '+569 12345637',
            'direccion' => 'Direccion de calle #123',
            'comuna' => 'Las Condes',
            'state' => 1,
         ]);

        $role = Role::create(['name' => 'paciente']);

        $user1->assignRole([$role->id]);



        $user2 = User::create([ 
            'name' => 'Nombre Doctor',
            'email' => 'doctor@email.cl',
            'password' => bcrypt('Juan1981'),
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'phone' => '+569 12345637',
            'direccion' => 'Direccion de calle #123',
            'comuna' => 'Las Condes',
            'state' => 1,
         ]);

        $role = Role::create(['name' => 'doctor']);

        $user2->assignRole([$role->id]);

    }
}
