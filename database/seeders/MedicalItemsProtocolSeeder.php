<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\Category;
use App\Models\Company;
use App\Models\ServiceDetail;
use App\Models\ProductDetail;
use Illuminate\Support\Facades\DB;

class MedicalItemsProtocolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $this->seedForCompany($company);
        }

        $this->command->info('Catálogo de ítems médicos (servicios y productos) inyectado exitosamente.');
    }

    private function seedForCompany($company)
    {
        // 1. Mapeo de Categorías (Buscamos las creadas anteriormente)
        $categories = Category::where('company_id', $company->id)->get();

        $getCatId = function($name) use ($categories) {
            return $categories->firstWhere('name', $name)?->id;
        };

        // --- SERVICIOS ---
        $services = [
            [
                'category_id' => $getCatId('Traumatología y Post-Operados'),
                'name' => 'SESIÓN KINESIOLOGÍA TRAUMATOLÓGICA',
                'sku' => 'KINE-TRAUMA-01',
                'price' => 25000,
                'duration' => 60,
                'commission' => 12500,
                'requires_diagnosis' => true
            ],
            [
                'category_id' => $getCatId('REHABILITACIÓN CLÍNICA'),
                'name' => 'EVALUACIÓN KINÉSICA INTEGRAL',
                'sku' => 'KINE-EVAL-INIT',
                'price' => 40000,
                'duration' => 45,
                'commission' => 20000,
                'requires_diagnosis' => false
            ],
            [
                'category_id' => $getCatId('Piso Pélvico y Salud de la Mujer'),
                'name' => 'SESIÓN PISO PÉLVICO',
                'sku' => 'KINE-PELVIC-01',
                'price' => 35000,
                'duration' => 60,
                'commission' => 17500,
                'requires_diagnosis' => true
            ],
            [
                'category_id' => $getCatId('Readaptación Deportiva'),
                'name' => 'READAPTACIÓN DEPORTIVA CAMPO',
                'sku' => 'SPORT-READAPT-01',
                'price' => 30000,
                'duration' => 60,
                'commission' => 15000,
                'requires_diagnosis' => false
            ],
            [
                'category_id' => $getCatId('Masoterapia'),
                'name' => 'MASAJE DESCONTRACTURANTE ESPALDA',
                'sku' => 'WELL-MASS-01',
                'price' => 28000,
                'duration' => 45,
                'commission' => 14000,
                'requires_diagnosis' => false
            ],
        ];

        foreach ($services as $srv) {
            DB::transaction(function() use ($company, $srv) {
                $item = Item::updateOrCreate(
                    [
                        'company_id' => $company->id,
                        'sku' => $srv['sku']
                    ],
                    [
                        'category_id' => $srv['category_id'],
                        'type' => 'service',
                        'name' => $srv['name'],
                        'price' => $srv['price'],
                        'is_exempt' => true,
                        'is_active' => true
                    ]
                );

                ServiceDetail::updateOrCreate(
                    ['item_id' => $item->id],
                    [
                        'duration_minutes' => $srv['duration'],
                        'default_doctor_commission_clp' => $srv['commission'],
                        'requires_diagnosis' => $srv['requires_diagnosis']
                    ]
                );
            });
        }

        // --- PRODUCTOS ---
        $products = [
            [
                'category_id' => $getCatId('Insumos y Ortopedia'),
                'name' => 'BANDA ELÁSTICA NIVEL 2 (AZUL)',
                'sku' => 'PROD-BAND-B2',
                'price' => 6500,
                'cost' => 3000,
                'stock' => 50,
                'critical' => 10
            ],
            [
                'category_id' => $getCatId('Insumos y Ortopedia'),
                'name' => 'KINESIOTAPE ROLLO 5M',
                'sku' => 'PROD-TAPE-01',
                'price' => 12000,
                'cost' => 5500,
                'stock' => 100,
                'critical' => 15
            ],
            [
                'category_id' => $getCatId('Suplementación'),
                'name' => 'PROTEINA WHEY 1KG',
                'sku' => 'PROD-WHEY-01',
                'price' => 35000,
                'cost' => 18000,
                'stock' => 20,
                'critical' => 5
            ],
        ];

        foreach ($products as $prod) {
            DB::transaction(function() use ($company, $prod) {
                $item = Item::updateOrCreate(
                    [
                        'company_id' => $company->id,
                        'sku' => $prod['sku']
                    ],
                    [
                        'category_id' => $prod['category_id'],
                        'type' => 'product',
                        'name' => $prod['name'],
                        'price' => $prod['price'],
                        'is_exempt' => false,
                        'is_active' => true
                    ]
                );

                ProductDetail::updateOrCreate(
                    ['item_id' => $item->id],
                    [
                        'cost_price' => $prod['cost'],
                        'stock' => $prod['stock'],
                        'critical_stock' => $prod['critical'],
                        'manage_stock' => true
                    ]
                );
            });
        }
    }
}
