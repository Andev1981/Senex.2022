<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DteCertificationClientSeeder extends Seeder
{
    public function run(): void
    {
        $company = \App\Models\Company::first(); // Asumimos que la primera es la de desarrollo
        if (!$company) return;

        $patient = \App\Models\Patient::updateOrCreate(
            ['rut' => '55555555-5'],
            [
                'company_id' => $company->id,
                'name' => 'RECEPTOR PRUEBA',
                'last_name' => 'SII CERTIFICACIÓN',
                'email' => 'dte@sii.cl',
                'phone' => '+56900000000',
                'gender' => 'other',
                'status' => 'active',
                'birth_date' => '1990-01-01',
                'occupation' => 'CERTIFICACIÓN DTE',
            ]
        );

        // Vincular a la empresa y sus sucursales
        $branches = $company->branches;
        foreach ($branches as $branch) {
            $patient->branches()->syncWithoutDetaching([$branch->id]);
        }

        // Crear dirección estándar
        if ($patient->addresses()->count() === 0) {
            $patient->addresses()->create([
                'street' => 'CALLE DE PRUEBA SII',
                'number' => '123',
                'commune_id' => 13101, // Santiago
                'is_primary' => true
            ]);
        }
    }
}
