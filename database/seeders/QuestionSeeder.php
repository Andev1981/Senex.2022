<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        #1
        Question::create([
            'name' => 'Sexo / Género',
            'type' => 'text'
        ]);

        #2
        Question::create([
            'name' => 'Peso actual',
            'type' => 'text'
        ]);

        #3
        Question::create([
            'name' => 'Cirugía',
            'type' => 'text-area'
        ]);


        #4
        Question::create([
            'name' => 'Alérgias',
            'type' => 'text-area'
        ]);


        #5
        Question::create([
            'name' => 'Patologías o enfermedades relevantes',
            'type' => 'text-area'
        ]);

        #6
        Question::create([
            'name' => 'Medicamentos frecuentemente',
            'type' => 'text-area'
        ]);

        #7
        Question::create([
            'name' => 'Seguro de salud',
            'type' => 'text'
        ]);

        #8
        Question::create([
            'name' => 'Observaciones',
            'type' => 'text-area'
        ]);
    }
}
