<?php

namespace App\Http\Requests;

class ValidationMessages
{
    public function messages(): array
    {
        return [
            // (los mismos mensajes que ya te compartí; los centralizo para reusar)
            'treatment_id.required' => 'El tratamiento es obligatorio.',
            'treatment_id.exists'   => 'El tratamiento seleccionado no existe.',
            'appointment_id.exists' => 'La cita seleccionada no existe.',
            'doctor_id.required'    => 'El kinesiólogo/doctor es obligatorio.',
            'doctor_id.exists'      => 'El kinesiólogo/doctor seleccionado no existe.',
            'patient_id.required'   => 'El paciente es obligatorio.',
            'patient_id.exists'     => 'El paciente seleccionado no existe.',
            'session_type_id.required' => 'El tipo de sesión es obligatorio.',
            'session_type_id.exists'   => 'El tipo de sesión seleccionado no existe.',
            'room_id.exists'        => 'La sala seleccionada no existe.',
            'branch_id.required'    => 'La sucursal es obligatoria.',
            'branch_id.exists'      => 'La sucursal seleccionada no existe.',

            'date.required'          => 'La fecha es obligatoria.',
            'date.date'              => 'La fecha no tiene un formato válido.',
            'time.required'          => 'La hora es obligatoria.',
            'time.date_format'       => 'La hora debe tener formato HH:MM (24h).',
            'duration.integer'       => 'La duración debe ser un número entero de minutos.',
            'duration.min'           => 'La duración mínima es de 1 minuto.',
            'duration.max'           => 'La duración máxima permitida es de 480 minutos.',
            'status.required'        => 'El estado es obligatorio.',
            'status.in'              => 'El estado seleccionado no es válido.',

            'pain_before.integer'    => 'El dolor inicial debe ser un número entero.',
            'pain_before.between'    => 'El dolor inicial debe estar entre 0 y 10.',
            'pain_after.integer'     => 'El dolor final debe ser un número entero.',
            'pain_after.between'     => 'El dolor final debe estar entre 0 y 10.',

            'rom_flexion_before.integer'   => 'La flexión inicial debe ser un número entero.',
            'rom_flexion_before.between'   => 'La flexión inicial debe estar entre 0° y 180°.',
            'rom_flexion_after.integer'    => 'La flexión final debe ser un número entero.',
            'rom_flexion_after.between'    => 'La flexión final debe estar entre 0° y 180°.',
            'rom_rotation_before.integer'  => 'La rotación inicial debe ser un número entero.',
            'rom_rotation_before.between'  => 'La rotación inicial debe estar entre 0° y 180°.',
            'rom_rotation_after.integer'   => 'La rotación final debe ser un número entero.',
            'rom_rotation_after.between'   => 'La rotación final debe estar entre 0° y 180°.',
            'rom_abduction_before.integer' => 'La abducción inicial debe ser un número entero.',
            'rom_abduction_before.between' => 'La abducción inicial debe estar entre 0° y 180°.',
            'rom_abduction_after.integer'  => 'La abducción final debe ser un número entero.',
            'rom_abduction_after.between'  => 'La abducción final debe estar entre 0° y 180°.',

            'notes.string'           => 'Las notas deben ser texto.',
            'notes.max'              => 'Las notas no pueden superar los 2000 caracteres.',
            'techniques.array'       => 'Las técnicas deben enviarse como lista.',
            'techniques.*.string'    => 'Cada técnica debe ser texto.',
            'techniques.*.max'       => 'Cada técnica no puede superar 100 caracteres.',
            'exercises.array'        => 'Los ejercicios deben enviarse como lista.',
            'exercises.*.string'     => 'Cada ejercicio debe ser texto.',
            'exercises.*.max'        => 'Cada ejercicio no puede superar 100 caracteres.',
            'homework.array'         => 'Las tareas domiciliarias deben enviarse como lista.',
            'homework.*.string'      => 'Cada tarea domiciliaria debe ser texto.',
            'homework.*.max'         => 'Cada tarea domiciliaria no puede superar 200 caracteres.',
            'next_goals.array'       => 'Las metas próximas deben enviarse como lista.',
            'next_goals.*.string'    => 'Cada meta próxima debe ser texto.',
            'next_goals.*.max'       => 'Cada meta próxima no puede superar 200 caracteres.',

            'attended_at.date'       => 'La fecha/hora de atención no es válida.',
            'patient_amount_clp.numeric' => 'El monto paciente debe ser numérico.',
            'patient_amount_clp.min'     => 'El monto paciente no puede ser negativo.',
            'doctor_amount_clp.numeric'  => 'El monto del doctor debe ser numérico.',
            'doctor_amount_clp.min'      => 'El monto del doctor no puede ser negativo.',
            'clinic_amount_clp.numeric'  => 'El monto de la clínica debe ser numérico.',
            'clinic_amount_clp.min'      => 'El monto de la clínica no puede ser negativo.',

            'meta.array'             => 'El campo meta debe ser un objeto/array.',
        ];
    }

    public function attributes(): array
    {
        return [
            'treatment_id' => 'tratamiento',
            'appointment_id' => 'cita',
            'doctor_id' => 'kinesiólogo/doctor',
            'patient_id' => 'paciente',
            'session_type_id' => 'tipo de sesión',
            'room_id' => 'sala',
            'branch_id' => 'sucursal',
            'date' => 'fecha',
            'time' => 'hora',
            'duration' => 'duración',
            'status' => 'estado',
            'pain_before' => 'dolor inicial',
            'pain_after' => 'dolor final',
            'rom_flexion_before' => 'flexión inicial',
            'rom_flexion_after' => 'flexión final',
            'rom_rotation_before' => 'rotación inicial',
            'rom_rotation_after' => 'rotación final',
            'rom_abduction_before' => 'abducción inicial',
            'rom_abduction_after' => 'abducción final',
            'techniques' => 'técnicas',
            'exercises' => 'ejercicios',
            'notes' => 'notas',
            'homework' => 'tareas domiciliarias',
            'next_goals' => 'próximas metas',
            'attended_at' => 'atendido en',
            'patient_amount_clp' => 'monto paciente',
            'doctor_amount_clp' => 'monto doctor',
            'clinic_amount_clp' => 'monto clínica',
            'meta' => 'meta',
        ];
    }
}
