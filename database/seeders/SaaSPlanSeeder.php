<?php

namespace Database\Seeders;

use App\Models\SaaSPlan;
use Illuminate\Database\Seeder;

class SaaSPlanSeeder extends Seeder
{
    public function run(): void
    {
        SaaSPlan::create([
            'name' => 'Básico',
            'code' => 'basic',
            'price_monthly' => 50000,
            'features' => [
                'Hasta 50 pacientes',
                'Hasta 3 kinesiólogos',
                'Agenda y Ficha Clínica',
                'Soporte por email',
            ],
        ]);

        SaaSPlan::create([
            'name' => 'Profesional',
            'code' => 'professional',
            'price_monthly' => 100000,
            'features' => [
                'Pacientes ilimitados',
                'Hasta 10 kinesiólogos',
                'Módulos de Facturación y Convenios',
                'Soporte prioritario',
            ],
        ]);

        SaaSPlan::create([
            'name' => 'Enterprise',
            'code' => 'enterprise',
            'price_monthly' => 200000,
            'features' => [
                'Todo lo del plan Profesional',
                'Multi-sucursal',
                'Reportes avanzados',
                'Soporte 24/7',
            ],
        ]);
    }
}
