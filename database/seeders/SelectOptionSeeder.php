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
        SelectOption::create([
            'sort_order' => 0, 
            'name' =>'Madre',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 1, 
            'name' =>'Padre',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 2, 
            'name' =>'Hija',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 3, 
            'name' =>'Hijo',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 4, 
            'name' =>'Nieta',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 5, 
            'name' =>'Nieto',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 7, 
            'name' =>'Sobrina',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 8, 
            'name' =>'Sobrino',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 9, 
            'name' =>'Tia',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 10, 
            'name' =>'Tio',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ],[
            'sort_order' => 1, 
            'name' =>'Otro',
            'detail' =>'Vecino a cargo',
            'select_optionable_id' =>1,
            'select_optionable_type' =>'App\Models\Keepers',
        ]);
    }
}
