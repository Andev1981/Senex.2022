<?php

namespace Database\Seeders;

use App\Models\QuizzQuestion;
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
        QuizzQuestion::create([
            'question' => 'Indíquenos su sexo',
            'quizz_id' => 1
        ]);

        #2
        QuizzQuestion::create([
            'question' => 'Indique su peso actual',
            'quizz_id' => 1
        ]);

        #3
        QuizzQuestion::create([
            'question' => 'Indique patologías o enfermedades relevantes (marca las que apliquen)',
            'quizz_id' => 1
        ]);

        #4
        QuizzQuestion::create([
            'question' => '¿Se ha realizado cirugías anteriormente?',
            'quizz_id' => 1
        ]);

        #5
        QuizzQuestion::create([
            'question' => '¿Es alérgico/a a algún medicamento?',
            'quizz_id' => 1
        ]);

        #6
        QuizzQuestion::create([
            'question' => '¿Utiliza medicamentos frecuentemente?',
            'quizz_id' => 1
        ]);

        #7
        QuizzQuestion::create([
            'question' => '¿Utiliza algún método anticonceptivo?',
            'quizz_id' => 1
        ]);

        #8
        QuizzQuestion::create([
            'question' => '¿Está embarazada?',
            'quizz_id' => 1
        ]);

        #9
        QuizzQuestion::create([
            'question' => '¿Está amamantando?',
            'quizz_id' => 1
        ]);

        #10
        QuizzQuestion::create([
            'question' => 'Cuéntanos con más detalle cual es el motivo de tu consulta.',
            'quizz_id' => 1
        ]);

    }
}
