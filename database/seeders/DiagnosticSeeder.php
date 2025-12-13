<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiagnosticSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $diagnostics = [
            // ===============================================
            // M: Enfermedades del sistema osteomuscular
            // ===============================================
            ['code' => 'M54.5', 'description' => 'Lumbalgia no especificada (Dolor de espalda baja)'],
            ['code' => 'M75.1', 'description' => 'Síndrome de manguito rotador'],
            ['code' => 'M17.1', 'description' => 'Osteoartrosis primaria de rodilla, unilateral'],
            ['code' => 'M42.1', 'description' => 'Osteocondrosis vertebral juvenil (Enfermedad de Scheuermann)'],
            ['code' => 'M51.2', 'description' => 'Desplazamiento de disco intervertebral, otros, con mielopatía'],
            ['code' => 'M79.1', 'description' => 'Mialgia (Dolor muscular)'],
            ['code' => 'M79.6', 'description' => 'Dolor en miembro no especificado'],
            ['code' => 'M25.5', 'description' => 'Dolor en la articulación'],
            ['code' => 'M72.0', 'description' => 'Fascitis palmar'],
            ['code' => 'M77.1', 'description' => 'Epicondilitis lateral (Codo de tenista)'],
            ['code' => 'M77.0', 'description' => 'Epicondilitis medial (Codo de golfista)'],
            
            // ===============================================
            // S: Lesiones, envenenamientos y otras consecuencias
            // ===============================================
            ['code' => 'S83.5', 'description' => 'Esguince y desgarro de ligamento cruzado anterior de la rodilla'],
            ['code' => 'S43.4', 'description' => 'Esguince y desgarro de ligamentos del hombro'],
            ['code' => 'S93.4', 'description' => 'Esguince y desgarro de ligamento del tobillo, no especificado'],
            ['code' => 'S93.5', 'description' => 'Esguince y desgarro de articulación del dedo del pie'],
            ['code' => 'S33.5', 'description' => 'Esguince y desgarro de la columna lumbar'],
            ['code' => 'S72.3', 'description' => 'Fractura de diáfisis del fémur'],

            // ===============================================
            // J: Enfermedades del sistema respiratorio
            // ===============================================
            ['code' => 'J45.9', 'description' => 'Asma no especificada'],
            ['code' => 'J44.9', 'description' => 'Enfermedad pulmonar obstructiva crónica (EPOC) no especificada'],
            ['code' => 'J20.9', 'description' => 'Bronquitis aguda no especificada'],
            ['code' => 'J18.9', 'description' => 'Neumonía no especificada'],
            
            // ===============================================
            // G: Enfermedades del sistema nervioso
            // ===============================================
            ['code' => 'G56.0', 'description' => 'Síndrome del túnel carpiano'],
            ['code' => 'G81.9', 'description' => 'Hemiplejía no especificada'],
            ['code' => 'G83.9', 'description' => 'Síndrome paralítico no especificado'],
            
            // ===============================================
            // R: Síntomas, signos y hallazgos anormales
            // ===============================================
            ['code' => 'R26.2', 'description' => 'Dificultad para la marcha, no clasificada en otra parte'],
            ['code' => 'R29.5', 'description' => 'Tetania'],
        ];

        // Inserta los datos en la tabla 'diagnostics'
        DB::table('diagnostics')->insert($diagnostics);
    }
}