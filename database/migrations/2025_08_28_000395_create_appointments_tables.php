<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();

            // Relaciones
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
            $table->foreignId('branch_id')
                      ->nullable()
                      ->constrained('branches')
                      ->nullOnDelete();
            $table->foreignId('room_id')
                      ->nullable()
                      ->constrained('rooms')
                      ->nullOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
    

            // Horarios
            $table->dateTime('start_at')->index();
            $table->dateTime('end_at')->index();

            // Estado de la cita
            $table->enum('status', [
                'scheduled',   // cita agendada
                'checked_in',  // paciente llegó
                'in_progress', // en curso
                'completed',   // finalizada
                'cancelled',   // cancelada
                'no_show',     // paciente no asistió
            ])->default('scheduled')->index();

            // Timestamps de eventos
            $table->dateTime('check_in_at')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();

            // Extras
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Restricciones útiles: evitar solapamiento por doctor
            $table->index(['doctor_id', 'start_at', 'end_at'], 'appointments_doctor_time_idx');
            $table->index(['patient_id', 'start_at'], 'appointments_patient_time_idx');
            $table->index(['branch_id', 'start_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
