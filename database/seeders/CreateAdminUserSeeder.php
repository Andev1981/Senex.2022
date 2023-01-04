<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\Date;
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
            'rut' => '15449806-0',
            'birthday' => Carbon::parse('14-12-1981'),
            'state' => 1,
            'avatar' => '',
            'password' => bcrypt('Juan1981')
        ]);

        $role = Role::create(['name' => 'Admin']);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#2
        $user = User::create([
            'name' => 'Mónica Fagres',
            'email' => 'mfagres@gmail.com',
            'rut' => '9006869-5',
            'birthday' => Carbon::parse('08-01-1963'),
            'state' => 1,
            'avatar' => '',
            'password' => bcrypt('9006')
        ]);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#1
        $user = User::create([
            'name' => 'Marco Jadue',
            'email' => 'bravitos4j@hotmail.com',
            'rut' => '6285558-4',
            'birthday' => Carbon::parse('16-05-1954'),
            'state' => 1,
            'avatar' => '',
            'password' => bcrypt('9006')
        ]);

        $permissions = Permission::pluck('id','id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);
         //#2
         $user1 = User::create([
            'name' => 'Paciente 1',
            'email' => 'correo@paciente.com',
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'state' => 1,
            'password' => bcrypt('password')
        ]);

        Patient::create([ 
            'user_id' => $user1->id,
            'phone' => '+569 12345637',
            'direccion' => 'Direccion de calle #123',
            'comuna' => 'Las Condes',
         ]);

        $role = Role::create(['name' => 'Paciente']);

        $user1->assignRole([$role->id]);


          //#3
          $user2 = User::create([
            'name' => 'Doctor 1',
            'email' => 'correo@doctor.com',
            'rut' => '12345678-9',
            'birthday' => Carbon::parse('14-12-1990'),
            'avatar' => '',
            'state' => 1,
            'password' => bcrypt('password')
        ]);

        $role = Role::create(['name' => 'Doctor']);

        $user2->assignRole([$role->id]);

    }
}
