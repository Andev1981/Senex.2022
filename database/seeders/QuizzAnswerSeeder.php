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
            'solicitud_id' => 1,
            'quizz_question_id' => 1,
        ]);

        #2
        QuizzAnswer::create([
            'answer' => '75kgs',
            'solicitud_id' => 1,
            'quizz_question_id' => 2,
        ]);

        #3
        QuizzAnswer::create([
            'answer' => 'Sin registros',
            'solicitud_id' => 1,
            'quizz_question_id' => 3,
        ]);

        #4
        QuizzAnswer::create([
            'answer' => 'Si: vasectomía',
            'solicitud_id' => 1,
            'quizz_question_id' => 4,
        ]);

        #5
        QuizzAnswer::create([
            'answer' => 'No',
            'solicitud_id' => 1,
            'quizz_question_id' => 5,
        ]);

        #6
        QuizzAnswer::create([
            'answer' => 'No',
            'solicitud_id' => 1,
            'quizz_question_id' => 6,
        ]);

        #7
        QuizzAnswer::create([
            'answer' => 'No',
            'solicitud_id' => 1,
            'quizz_question_id' => 7,
        ]);

        #8
        QuizzAnswer::create([
            'answer' => 'No',
            'solicitud_id' => 1,
            'quizz_question_id' => 8,
        ]);

        #9
        QuizzAnswer::create([
            'answer' => 'No',
            'solicitud_id' => 1,
            'quizz_question_id' => 9,
        ]);

        #11
        QuizzAnswer::create([
            'answer' => 'Detalle mas extenso del motivo de la consulta',
            'solicitud_id' => 1,
            'quizz_question_id' => 10,
        ]);

    }
}
