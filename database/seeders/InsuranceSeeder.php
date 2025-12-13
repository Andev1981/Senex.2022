<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InsuranceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $insurances = [
            // ===============================================
            // 1. INSTITUCIÓN PROPIA (CLINIC)
            // Este es el registro que representa a tu propia clínica
            // y que usarás como la entidad emisora.
            // ===============================================
            [
                'name' => 'Tu Clínica',
                'rut' => '76.387.221-1', // 🎯 Reemplazar con el RUT real de tu empresa
                'institution_type' => 'clinic',
                'contact_email' => 'contabilidad@tuclinica.cl',
                'contact_phone' => '+562XXXXXXXX',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ===============================================
            // 2. SALUD PÚBLICA (FONASA)
            // ===============================================
            [
                'name' => 'Fondo Nacional de Salud (FONASA)',
                'rut' => '61.700.000-K',
                'institution_type' => 'health_insurer',
                'contact_email' => null,
                'contact_phone' => '600 360 3000',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ===============================================
            // 3. ISAPRES ABIERTAS (HEALTH_INSURER)
            // Se incluyen las principales Isapres a la fecha.
            // ===============================================
            [
                'name' => 'Isapre Colmena Golden Cross',
                'rut' => '78.000.000-1',
                'institution_type' => 'health_insurer',
                'contact_email' => null,
                'contact_phone' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Isapre CruzBlanca',
                'rut' => '99.510.000-K',
                'institution_type' => 'health_insurer',
                'contact_email' => null,
                'contact_phone' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Isapre Consalud',
                'rut' => '96.840.450-K',
                'institution_type' => 'health_insurer',
                'contact_email' => null,
                'contact_phone' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Isapre Banmédica',
                'rut' => '96.938.620-8',
                'institution_type' => 'health_insurer',
                'contact_email' => null,
                'contact_phone' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // ===============================================
            // 4. SEGUROS COMPLEMENTARIOS (INSURANCE_COMPANY)
            // Se incluyen ejemplos de seguros complementarios comunes.
            // ===============================================
            [
                'name' => 'BICE Vida (Seguro Complementario)',
                'rut' => '96.641.480-1',
                'institution_type' => 'insurance_company',
                'contact_email' => null,
                'contact_phone' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mapfre (Seguro de Salud)',
                'rut' => '96.539.950-7',
                'institution_type' => 'insurance_company',
                'contact_email' => null,
                'contact_phone' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('insurances')->insert($insurances);
    }
}