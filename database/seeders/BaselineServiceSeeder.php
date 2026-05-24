<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\Category;
use App\Models\Company;
use App\Models\ServiceDetail;
use Illuminate\Support\Facades\DB;

class BaselineServiceSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $category = Category::where('company_id', $company->id)
                ->where('name', 'REHABILITACIÓN CLÍNICA')
                ->first() ?? Category::create([
                    'company_id' => $company->id,
                    'name' => 'REHABILITACIÓN CLÍNICA',
                    'is_active' => true
                ]);

            $item = Item::updateOrCreate(
                [
                    'company_id' => $company->id,
                    'sku' => 'BASELINE-01'
                ],
                [
                    'category_id' => $category->id,
                    'type' => 'service',
                    'name' => 'Evaluación de Ingreso (Baseline)',
                    'description' => 'Sesión inicial gratuita para captura de línea base y objetivos clínicos.',
                    'price' => 0,
                    'is_exempt' => true,
                    'is_active' => true
                ]
            );

            ServiceDetail::updateOrCreate(
                ['item_id' => $item->id],
                [
                    'duration_minutes' => 45,
                    'default_doctor_commission_clp' => 0,
                    'requires_diagnosis' => false,
                    'is_evaluation' => true,
                    'specialty' => 'Kinesiología'
                ]
            );
        }

        $this->command->info('Servicio de Evaluación de Ingreso (Baseline) inyectado.');
    }
}
