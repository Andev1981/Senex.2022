<?php

namespace Database\Seeders;

use App\Models\Quizz;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        #1
        Quizz::create([
            'name' => 'Encuesta principal de consulta',
            'type' => 0
        ]);
    }
}
