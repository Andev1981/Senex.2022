<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Database\Seeder;
use App\Models\User;
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

        $questions = Question::all();

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

        $permissions = Permission::pluck('id', 'id')->all();

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

        $permissions = Permission::pluck('id', 'id')->all();

        $role = Role::create(['name' => 'admin']);

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#3
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

        $permissions = Permission::pluck('id', 'id')->all();

        $role->syncPermissions($permissions);

        $user->assignRole([$role->id]);

        //#4
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


        $user1->assignRole([$role->id]);





        $user2 = User::create([
            'name' => 'Yanina',
            'last_name' => 'jadue Fagres',
            'email' => 'yani.jadue@gmail.cl',
            'password' => bcrypt('Juan1981'),
            'avatar' => '',
            'rut' => '16094552-4',
            'birth' => '1985-01-10',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Kine'
        ]);

        $role = Role::create(['name' => 'kine']);

        $user2->assignRole([$role->id]);


        /* Nuevos Pacientes Para Insertar */
        $paciente1 = User::create([
            'name' => 'Juan',
            'last_name' => 'Lombardi Solari',
            'email' => 'juanjoselombardi@gmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '3996311-6',
            'birth' => '1941-01-01',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);

        $role = Role::create(['name' => 'patient']);
        $paciente1->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente1->id,
                'question_id' => $question->id,
            ]);
        }


        $paciente2 = User::create([
            'name' => 'Mireya',
            'last_name' => 'Esquivel Muñoz',
            'email' => 'mireya_esquivel@hotmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '5898728-k',
            'birth' => null,
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente2->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente2->id,
                'question_id' => $question->id,
            ]);
        }

        $paciente3 = User::create([
            'name' => 'Paul',
            'last_name' => 'Dulovits',
            'email' => 'p.dulovits@gmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '12027832-0',
            'birth' => null,
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente3->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente3->id,
                'question_id' => $question->id,
            ]);
        }

        $paciente4 = User::create([
            'name' => 'Maria José',
            'last_name' => 'Hudson Meyer',
            'email' => 'mjhudson@miuandes.cl',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '18934908-4',
            'birth' => '1994-11-19',
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Kine'
        ]);
        $paciente4->assignRole([4]);


        $paciente5 = User::create([
            'name' => 'Cristobal',
            'last_name' => 'Navarrete Arenas',
            'email' => 'cristobal.navarret.a@gmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '18635456-7',
            'birth' => '1993-09-27',
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Kine'
        ]);
        $paciente5->assignRole([4]);

        $paciente6 = User::create([
            'name' => 'Maria',
            'last_name' => 'Pita',
            'email' => 'mezaj@mi.cl',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => null,
            'birth' => '1935-01-01',
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente6->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente6->id,
                'question_id' => $question->id,
            ]);
        }

        $paciente7 = User::create([
            'name' => 'Gabriela',
            'last_name' => 'Cabrera',
            'email' => 'gabriela.cabrera.u@gmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '16605674-8',
            'birth' => '1988-01-01',
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente7->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente7->id,
                'question_id' => $question->id,
            ]);
        }

        $paciente8 = User::create([
            'name' => 'Irma',
            'last_name' => 'Caro',
            'email' => 'emilialucocaro@hotmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '4437304-3',
            'birth' => '1948-01-01',
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente8->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente8->id,
                'question_id' => $question->id,
            ]);
        }

        $paciente9 = User::create([
            'name' => 'Soledad',
            'last_name' => 'Alday Alvares',
            'email' => 'saldayalvares@gmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '12085744-4',
            'birth' => '1968-01-01',
            'phone' => null,
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente9->assignRole([3]);

        foreach ($questions as $question) {
            Answer::create([
                'name' => '',
                'user_id' => $paciente9->id,
                'question_id' => $question->id,
            ]);
        }

        /*  $paciente10 = User::create([
            'name' => 'Daisy',
            'last_name' => 'Muñoz',
            'email' => 'disi2601@gmail.com',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '6885208-0',
            'birth' => '01-01-1958',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente10->assignRole([3]);

        $paciente11 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente11->assignRole([3]);

        $paciente12 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente12->assignRole([3]); */

        /*  $paciente13 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente13->assignRole([3]);

        $paciente14 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente14->assignRole([3]);

        $paciente15 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente15->assignRole([3]);

        $paciente16 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente16->assignRole([3]);

        $paciente17 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente17->assignRole([3]);

        $paciente18 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente18->assignRole([3]);

        $paciente19 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente19->assignRole([3]);

        $paciente20 = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente20->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);

        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]);


        $paciente = User::create([
            'name' => '',
            'last_name' => '',
            'email' => '',
            'password' => bcrypt('PacienteSenex2023.-'),
            'avatar' => '',
            'rut' => '',
            'birth' => '',
            'phone' => '',
            'address_id' => $address->id,
            'status' => 1,
            'user_type' => 'Paciente'
        ]);
        $paciente->assignRole([3]); */
    }
}
