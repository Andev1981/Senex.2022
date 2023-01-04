<?php

namespace Database\Seeders;

use App\Models\Price;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Price::create([
            'precio' => 15000,
            'doctor_id' => 1,
            'solicitud_type_id' => 1,
        ]);

        Price::create([
            'precio' => 25000,
            'doctor_id' => 1,
            'solicitud_type_id' => 2,
        ]);

        Price::create([
            'precio' => 35000,
            'doctor_id' => 1,
            'solicitud_type_id' => 3,
        ]);
    }
}
