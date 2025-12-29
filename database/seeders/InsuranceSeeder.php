<?php

namespace Database\Seeders;

use App\Models\Insurance;
use App\Models\Plan;
use Illuminate\Database\Seeder;

use Faker\Factory as Faker;



class InsuranceSeeder extends Seeder

{

    public function run(array $parameters = null)

    {

        $faker = Faker::create('es_CL');

        $company = $parameters['company'];



        $insurances = [

            ['name' => 'Fondo Nacional de Salud (FONASA)', 'institution_type' => 'health_insurer'],

            ['name' => 'Isapre Colmena Golden Cross', 'institution_type' => 'health_insurer'],

            ['name' => 'Isapre CruzBlanca', 'institution_type' => 'health_insurer'],

            ['name' => 'Isapre Consalud', 'institution_type' => 'health_insurer'],

            ['name' => 'Isapre Banmédica', 'institution_type' => 'health_insurer'],

            ['name' => 'BICE Vida (Seguro Complementario)', 'institution_type' => 'insurance_company'],

            ['name' => 'Mapfre (Seguro de Salud)', 'institution_type' => 'insurance_company'],

        ];



        foreach ($insurances as $insuranceData) {

            $insurance = Insurance::create([

                'company_id' => $company->id,

                'name' => $company->id . ' - ' . $insuranceData['name'],

                'rut' => $faker->unique()->numerify('########-#'),

                'institution_type' => $insuranceData['institution_type'],

                'is_active' => true,

            ]);



            // Create some plans for each insurance

            for ($i = 0; $i < 3; $i++) {

                Plan::create([

                    'company_id' => $company->id,

                    'insurance_id' => $insurance->id,

                    'name' => 'Plan ' . ($i + 1),

                    'code' => $insurance->id . '-P' . ($i + 1),

                    'price' => 10000,

                    'coverage_percentage' => 80,

                    'is_active' => true,

                ]);

            }

        }

    }

}



                

        