<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class CompanySeeder extends Seeder
{
    public function run(array $parameters = null)
    {
        $faker = Faker::create('es_CL');
        $company = $parameters['company'];
        $branches = $parameters['branches'];

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
                'rut' => $faker->unique()->numerify('########-#'),
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
                'rut' => $faker->unique()->numerify('########-#'),
                'email' => $faker->unique()->safeEmail,
            ]);
            $patient->branches()->sync($branches->random());
        }
    }
}
