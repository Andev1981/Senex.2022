<?php

namespace Database\Seeders;

use App\Models\Insurance;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class InsuranceSeeder extends Seeder
{
    public function run($company)
    {
        $insurances = [
            ['name' => 'Fondo Nacional de Salud (FONASA)', 'institution_type' => 'health_insurer', 'rut' => '61603000-0'],
            ['name' => 'Isapre Colmena Golden Cross', 'institution_type' => 'health_insurer', 'rut' => '96538340-4'],
            ['name' => 'Isapre CruzBlanca', 'institution_type' => 'health_insurer', 'rut' => '96515430-8'],
            ['name' => 'Isapre Consalud', 'institution_type' => 'health_insurer', 'rut' => '96500590-6'],
            ['name' => 'Isapre Banmédica', 'institution_type' => 'health_insurer', 'rut' => '96525140-0'],
            ['name' => 'BICE Vida (Seguro Complementario)', 'institution_type' => 'insurance_company', 'rut' => '96557400-5'],
            ['name' => 'Mapfre (Seguro de Salud)', 'institution_type' => 'insurance_company', 'rut' => '96541570-5'],
        ];

        foreach ($insurances as $insuranceData) {
            $insurance = Insurance::updateOrCreate(
                [
                    'company_id' => $company->id,
                    'name' => $company->id . ' - ' . $insuranceData['name']
                ],
                [
                    'rut' => $insuranceData['rut'],
                    'institution_type' => $insuranceData['institution_type'],
                    'is_active' => true,
                ]
            );
        }
    }
}
