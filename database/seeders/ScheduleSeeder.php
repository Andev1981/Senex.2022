<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        Schedule::create([
            'fecha_disponible' => '2002/08/2022',
            'quantity' => 1,
            'quantity_usage' => 1,
            'user_id' => 1,
        ]);

    }
}
