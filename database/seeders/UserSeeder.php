<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use App\Rules\ValidRut;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Log; 

class UserSeeder extends Seeder
{
    public function run($company, $branches)
    {
        $faker = Faker::create('es_CL');

             Log::info("UserSeeder");

        // ======== USERS ========
        $adminUser = User::create([
            'company_id' => $company->id,
            'name' => 'Admin ' . $company->business_name,
            'email' => 'admin@' . strtolower(str_replace(' ', '', $company->business_name)) . '.com',
            'password' => Hash::make('password'),
        ]);
        $adminUser->assignRole('admin');
        $adminUser->branches()->sync($branches);

        // ======== DOCTORS ========
        for ($i = 0; $i < 5; $i++) {
            $doctorUser = User::create([
                'company_id' => $company->id,
                'name' => $faker->firstName . ' ' . $faker->lastName,
                'email' => "doctor{$i}@" . strtolower(str_replace(' ', '', $company->business_name)) . '.com',
                'password' => Hash::make('password'),
            ]);
            $doctorUser->assignRole('kine');

            $doctor = Doctor::create([
                'company_id' => $company->id,
                'user_id' => $doctorUser->id,
                'name' => $doctorUser->name,
                'last_name' => '',
                'rut' => ValidRut::generate(),
                'email' => $doctorUser->email,
            ]);

            $doctorUser->branches()->sync($branches->random());
            $doctor->branches()->sync($branches->random());
        }

        // ======== PATIENTS ========
        for ($i = 0; $i < 20; $i++) {
            $patient = Patient::create([
                'company_id' => $company->id,
                'name' => $faker->firstName,
                'last_name' => $faker->lastName,
                'rut' => ValidRut::generate(),
                'email' => $faker->unique()->safeEmail,
            ]);
            $patient->branches()->sync($branches->random());
        }
    }
}
