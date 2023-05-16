<?php

namespace Database\Seeders;

use App\Models\QuizzAnswer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzAnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        #1
        QuizzAnswer::create([
            'answer' => 'HOMBRE',
            'quizz_question_id' => 1,
            'paciente_id' => 1,
        ]);

        #2
        QuizzAnswer::create([
            'answer' => '75kgs',
            'quizz_question_id' => 2,
            'paciente_id' => 1,

        ]);

        #3
        QuizzAnswer::create([
            'answer' => 'Sin registros',
            'quizz_question_id' => 3,
            'paciente_id' => 1,

        ]);

        #4
        QuizzAnswer::create([
            'answer' => 'Si: vasectomía',
            'quizz_question_id' => 4,
            'paciente_id' => 1,

        ]);

        #5
        QuizzAnswer::create([
            'answer' => 'No',
            'quizz_question_id' => 5,
            'paciente_id' => 1,

        ]);

        #6
        QuizzAnswer::create([
            'answer' => 'No',
            'quizz_question_id' => 6,
            'paciente_id' => 1,

        ]);

        #7
        QuizzAnswer::create([
            'answer' => 'Isapre Banmédica',
            'quizz_question_id' => 7,
            'paciente_id' => 1,

        ]);

        #8
        QuizzAnswer::create([
            'answer' => 'Observaciones generales del paciente',
            'quizz_question_id' => 8,
            'paciente_id' => 1,
        ]);
    }
}
