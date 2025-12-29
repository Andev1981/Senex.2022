<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\SessionType;
use Illuminate\Database\Seeder;

class SessionTypeSeeder extends Seeder
{
    public function run(array $parameters = null)
    {
        $company = $parameters['company'];

        $sessionTypes = [
            ['name' => 'Kinesiología General', 'base_price_clp' => 25000, 'default_doctor_commission_clp' => 12000],
            ['name' => 'Kinesiología Respiratoria', 'base_price_clp' => 30000, 'default_doctor_commission_clp' => 15000],
            ['name' => 'Rehabilitación Deportiva', 'base_price_clp' => 35000, 'default_doctor_commission_clp' => 17000],
            ['name' => 'Evaluación Inicial', 'base_price_clp' => 40000, 'default_doctor_commission_clp' => 20000],
        ];

        foreach ($sessionTypes as $type) {
            SessionType::create([
                'company_id' => $company->id,
                'name' => $company->id . ' - ' . $type['name'],
                'base_price_clp' => $type['base_price_clp'],
                'default_doctor_commission_clp' => $type['default_doctor_commission_clp'],
                'is_active' => true,
            ]);
        }
    }
}
