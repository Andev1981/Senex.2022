<?php

namespace Database\Seeders;

use App\Models\SelectOption;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SelectOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        SelectOption::insert([[
            "sort_order" => 0, 
            "name" =>"Madre",
            "model_type" =>"Keepers",
        ],[
            "sort_order" => 1, 
            "name" =>"Padre",
              "model_type" =>"Keepers",
        ],[
            "sort_order" => 2, 
            "name" =>"Hija",
             "model_type" =>"Keepers",
        ],[
            "sort_order" => 3, 
            "name" =>"Hijo",
             "model_type" =>"Keepers",
        ],[
            "sort_order" => 4, 
            "name" =>"Nieta",
             "model_type" =>"Keepers",
        ],[
            "sort_order" => 5, 
            "name" =>"Nieto",
              "model_type" =>"Keepers",
        ],[
            "sort_order" => 7, 
            "name" =>"Sobrina",
             "model_type" =>"Keepers",
        ],[
            "sort_order" => 8, 
            "name" =>"Sobrino",
              "model_type" =>"Keepers",
        ],[
            "sort_order" => 9, 
            "name" =>"Tia",
              "model_type" =>"Keepers",
        ],[
            "sort_order" => 10, 
            "name" =>"Tio",
            "model_type" =>"Keepers",
        ],[
            "sort_order" => 1, 
            "name" =>"Otro",
            "model_type" =>"Keepers",
        ]]);
    }
}
