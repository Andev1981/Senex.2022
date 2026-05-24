<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Company;

use Illuminate\Support\Str;

class CategorizationProtocolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        if ($companies->isEmpty()) {
            $this->command->warn('No se encontraron empresas para sembrar categorías.');
            return;
        }

        foreach ($companies as $company) {
            $this->seedForCompany($company);
        }

        $this->command->info('Estructura de categorías inyectada exitosamente para todas las empresas.');
    }

    private function seedForCompany($company)
    {
        $structure = [
            [
                'name' => 'REHABILITACIÓN CLÍNICA',
                'description' => 'Servicios de salud especializados, generalmente exentos de IVA.',
                'children' => [
                    ['name' => 'Traumatología y Post-Operados', 'description' => 'Rehabilitación de lesiones óseas y musculares.'],
                    ['name' => 'Neuro-Rehabilitación', 'description' => 'Tratamiento de afecciones del sistema nervioso.'],
                    ['name' => 'Piso Pélvico y Salud de la Mujer', 'description' => 'Especialidad en disfunciones pélvicas y obstetricia.'],
                    ['name' => 'Kinesiología Maxilofacial', 'description' => 'Tratamiento de articulación temporomandibular y post-cirugía facial.'],
                ]
            ],
            [
                'name' => 'PERFORMANCE Y PREVENCIÓN',
                'description' => 'Programas de entrenamiento y optimización deportiva (Afecto a IVA).',
                'children' => [
                    ['name' => 'Readaptación Deportiva', 'description' => 'Transición de la camilla al campo de juego.'],
                    ['name' => 'Reintegro Deportivo', 'description' => 'Entrenamiento de alto rendimiento post-lesión.'],
                ]
            ],
            [
                'name' => 'BIENESTAR Y ESTÉTICA',
                'description' => 'Servicios de relajación y cuidado personal (Afecto a IVA).',
                'children' => [
                    ['name' => 'Masoterapia', 'description' => 'Masajes descontracturantes y de relajación.'],
                    ['name' => 'Estética Avanzada', 'description' => 'Tratamientos dermato-funcionales y post-cirugía estética.'],
                ]
            ],
            [
                'name' => 'COMERCIALIZACIÓN',
                'description' => 'Venta de productos físicos e insumos.',
                'children' => [
                    ['name' => 'Insumos y Ortopedia', 'description' => 'Venta de bandas, soportes y ayudas técnicas.'],
                    ['name' => 'Suplementación', 'description' => 'Nutrición deportiva y vitaminas.'],
                ]
            ],
        ];

        foreach ($structure as $group) {
            $parent = Category::updateOrCreate(
                [
                    'company_id' => $company->id,
                    'name' => $group['name']
                ],
                [
                    'slug' => Str::slug($group['name']) . '-' . $company->id,
                    'description' => $group['description'],
                    'is_active' => true
                ]
            );

            if (isset($group['children'])) {
                foreach ($group['children'] as $child) {
                    Category::updateOrCreate(
                        [
                            'company_id' => $company->id,
                            'name' => $child['name'],
                            'parent_id' => $parent->id
                        ],
                        [
                            'slug' => Str::slug($child['name']) . '-' . $company->id,
                            'description' => $child['description'],
                            'is_active' => true
                        ]
                    );
                }
            }
        }
    }
}
