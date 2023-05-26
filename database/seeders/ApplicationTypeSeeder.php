<?php

namespace Database\Seeders;

use App\Models\ApplicationType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ApplicationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ApplicationType::insert([[
            "name"=> "Atención Estándar",
            "description" => "Atención kinesiológica",
        ],[
            "name"=> "Atención Urgencia",
            "description" => "Atención kinesiológica",
        ],[
            "name"=> "Atención Bebé",
            "description" => "Atención kinesiológica",
        ],[
            "name"=> "Atención Adulto Mayor",
            "description" => "Atención Adulto Mayor",
        ]]);
    }
}
