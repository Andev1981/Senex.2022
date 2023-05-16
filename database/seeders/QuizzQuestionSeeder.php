<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzQuestionSeeder extends Seeder
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
            'name' => 'Indíquenos su sexo',
        ]);

        #2
        Question::create([
            'name' => 'Indique su peso actual',
        ]);

        #3
        Question::create([
            'name' => 'Indique patologías o enfermedades relevantes',
        ]);

        #4
        Question::create([
            'name' => '¿Se ha realizado cirugías anteriormente?',
        ]);

        #5
        Question::create([
            'name' => '¿Es alérgico/a a algún medicamento?',
        ]);

        #6
        Question::create([
            'name' => '¿Utiliza medicamentos frecuentemente?¿Cuáles?',
        ]);

        #7
        Question::create([
            'name' => 'Indique el seguro de salud',
        ]);

        #8
        Question::create([
            'name' => 'Observaciones',
        ]);

    }
}
