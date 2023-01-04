<?php

namespace Database\Seeders;

use App\Models\SolicitudType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SolicitudTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         #1
         SolicitudType::create([
            'name' => 'Urgencia',
            'description' => 'solicitud'
        ]);

        #2
        SolicitudType::create([
            'name' => 'Adulto mayor',
            'description' => 'solicitud'
        ]);

        #3
        SolicitudType::create([
            'name' => 'Atención Bebé',
            'description' => 'solicitud'
        ]);

    }
}
