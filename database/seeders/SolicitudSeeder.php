<?php

namespace Database\Seeders;

use App\Models\Solicitud;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SolicitudSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /* Sin atender */
        Solicitud::create([
            'solicitud_type_id' => 1,
            'doctor_id' => 1,
            'patient_id' => 1,
            'quizz_id' => 1,
            'payment_id' => 1,
            'schedule_id' => 1,
            'attention_date' => Carbon::parse('14-12-1981 12:30:00'),
            'comments' => 'Comentarios iniciales de la atención 1',
        ]);

        Solicitud::create([
            'solicitud_type_id' => 2,
            'doctor_id' => 1,
            'patient_id' => 1,
            'quizz_id' => 1,
            'payment_id' => 1,
            'schedule_id' => 1,
            'attention_date' => Carbon::parse('14-12-1981 14:30:00'),
            'comments' => 'Comentarios iniciales de la atención 2',
        ]);

        Solicitud::create([
            'solicitud_type_id' => 3,
            'doctor_id' => 1,
            'patient_id' => 1,
            'quizz_id' => 1,
            'payment_id' => 1,
            'schedule_id' => 1,
            'attention_date' => Carbon::parse('14-12-1981 16:30:00'),
            'comments' => 'Comentarios iniciales de la atención 3',
        ]);

        /* Atendidas */
        Solicitud::create([
            'solicitud_type_id' => 1,
            'doctor_id' => 1,
            'patient_id' => 1,
            'quizz_id' => 1,
            'status' => 1,
            'payment_id' => 1,
            'schedule_id' => 1,
            'attention_date' => Carbon::parse('14-12-1981 16:30:00'),
            'comments' => 'Comentarios iniciales de la atención 4',
        ]);

        Solicitud::create([
            'solicitud_type_id' => 2,
            'doctor_id' => 1,
            'patient_id' => 1,
            'quizz_id' => 1,
            'status' => 1,
            'payment_id' => 1,
            'schedule_id' => 1,
            'attention_date' => Carbon::parse('14-12-1981 16:30:00'),
            'comments' => 'Comentarios iniciales de la atención 4',

        ]);

        Solicitud::create([
            'solicitud_type_id' => 3,
            'doctor_id' => 1,
            'patient_id' => 1,
            'quizz_id' => 1,
            'status' => 1,
            'payment_id' => 1,
            'schedule_id' => 1,
            'attention_date' => Carbon::parse('14-12-1981 16:30:00'),
            'comments' => 'Comentarios iniciales de la atención 4',
        ]);

    }
}
