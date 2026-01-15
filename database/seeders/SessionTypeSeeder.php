<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\SessionType;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class SessionTypeSeeder extends Seeder
{
    public function run($company)
    {
        
        $faker = Faker::create('es_CL');

        $typesData = [
            [
                'name'                          => 'Kinesiología General',
                'code'                          => 'KINE-GEN',
                'category'                      => $faker->randomElement(['kinesiology','evaluation','procedure','massage','other']),
                'duration_minutes'              => 60,
                'base_price_clp'                => 25000,
                'default_doctor_commission_clp' => 12000,
                'plan_discount_clp'             => 5000, // Descuento si tiene plan
                'requires_diagnosis'            => true,
                'requires_referral'             => true,
                'is_exempt'                     => true,
                'is_active'                     => true,
            ],
            [
                'name'                          => 'Kinesiología Respiratoria',
                'code'                          => 'KINE-RESP',
                'category'                      => $faker->randomElement(['kinesiology','evaluation','procedure','massage','other']),
                'duration_minutes'              => 45,
                'base_price_clp'                => 30000,
                'default_doctor_commission_clp' => 15000,
                'plan_discount_clp'             => 6000,
                'requires_diagnosis'            => true,
                'requires_referral'             => true,
                'is_exempt'                     => true,
                'is_active'                     => true,
            ],
            [
                'name'                          => 'Rehabilitación Deportiva',
                'code'                          => 'KINE-SPORT',
                'category'                      => $faker->randomElement(['kinesiology','evaluation','procedure','massage','other']),
                'duration_minutes'              => 60,
                'base_price_clp'                => 35000,
                'default_doctor_commission_clp' => 17000,
                'plan_discount_clp'             => 7000,
                'requires_diagnosis'            => true,
                'requires_referral'             => false,
                'is_exempt'                     => true,
                'is_active'                     => true,
            ],
            [
                'name'                          => 'Evaluación Inicial',
                'code'                          => 'KINE-EVAL',
                'category'                      => $faker->randomElement(['kinesiology','evaluation','procedure','massage','other']),
                'duration_minutes'              => 45, // Las evaluaciones suelen ser un poco más cortas o iguales
                'base_price_clp'                => 40000,
                'default_doctor_commission_clp' => 20000,
                'plan_discount_clp'             => 0, // Generalmente la evaluación no tiene dcto
                'requires_diagnosis'            => false, // No requiere diagnóstico previo porque ESTO ES el diagnóstico
                'requires_referral'             => false,
                'is_exempt'                     => true,
                'is_active'                     => true,
            ],
        ];

        // Creamos la colección vacía
        $sessionTypes = collect();

        // Iteramos, creamos en BD y guardamos en la colección
        foreach ($typesData as $data) {
            // Añadimos el company_id que viene por parámetro
            $data['company_id'] = $company->id;
            
            // Creamos y empujamos a la colección
            $sessionTypes->push(SessionType::create($data));
        }
    }
}
