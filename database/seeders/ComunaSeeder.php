<?php

namespace Database\Seeders;

use App\Models\Comuna;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ComunaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Comuna::insert([[
            "name"=> "Colina",
            "region_id" => 1,
        ],[
            "name"=> "Lampa",
            "region_id" => 1,
        ],[
            "name"=> "Til Til",
            "region_id" => 1,
        ],[
            "name"=> "Pirque",
            "region_id" => 1,
        ],[
            "name"=> "Puente Alto",
            "region_id" => 1,
        ],[
            "name"=> "San José de Maipo",
            "region_id" => 1,
        ],[
            "name"=> "Calera de Tango",
            "region_id" => 1,
        ],[
            "name"=> "Paine",
            "region_id" => 1,
        ],[
            "name"=> "San Bernardo",
            "region_id" => 1,
        ],[
            "name"=> "Alhué",
            "region_id" => 1,
        ],[
            "name"=> "Curacaví",
            "region_id" => 1,
        ],[
            "name"=> "Melipilla",
            "region_id" => 1,
        ],[
            "name"=> "San Pedro",
            "region_id" => 1,
        ],[
            "name"=> "Cerrillos",
            "region_id" => 1,
        ],[
            "name"=> "Cerro Navia",
            "region_id" => 1,
        ],[
            "name"=> "Conchalí",
            "region_id" => 1,
        ],[
            "name"=> "El Bosque",
            "region_id" => 1,
        ],[
            "name"=> "Estación Central",
            "region_id" => 1,
        ],[
            "name"=> "Huechuraba",
            "region_id" => 1,
        ],[
            "name"=> "Independencia",
            "region_id" => 1,
        ],[
            "name"=> "La Cisterna",
            "region_id" => 1,
        ],[
            "name"=> "La Granja",
            "region_id" => 1,
        ],[
            "name"=> "La Florida",
            "region_id" => 1,
        ],[
            "name"=> "La Pintana",
            "region_id" => 1,
        ],[
            "name"=> "La Reina",
            "region_id" => 1,
        ],[
            "name"=> "Las Condes",
            "region_id" => 1,
        ],[
            "name"=> "Lo Barnechea",
            "region_id" => 1,
        ],[
            "name"=> "Lo Espejo",
            "region_id" => 1,
        ],[
            "name"=> "Lo Prado",
            "region_id" => 1,
        ]]);
    }
}
