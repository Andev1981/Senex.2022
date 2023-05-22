<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Region::insert([[
            "name"=> "Metropolitana",
            "country_id" => 1,
        ],[
            "name"=> "Arica y Parinacota",
            "country_id" => 1,
        ],[
            "name"=> "Tarapacá",
            "country_id" => 1,
        ],[
            "name"=> "	Antofagasta",
            "country_id" => 1,
        ],[
            "name"=> "Atacama",
            "country_id" => 1,
        ],[
            "name"=> "Coquimbo",
            "country_id" => 1,
        ],[
            "name"=> "Valparaíso",
            "country_id" => 1,
        ],[
            "name"=> "O'Higgins",
            "country_id" => 1,
        ],[
            "name"=> "Maule",
            "country_id" => 1,
        ],[
            "name"=> "Ñuble",
            "country_id" => 1,
        ],[
            "name"=> "Biobío",
            "country_id" => 1,
        ],[
            "name"=> "La Araucanía",
            "country_id" => 1,
        ],[
            "name"=> "Los Rios",
            "country_id" => 1,
        ],[
            "name"=> "Los Lagos",
            "country_id" => 1,
        ],[
            "name"=> "Magallanes",
            "country_id" => 1,
        ]]);
    }
}
