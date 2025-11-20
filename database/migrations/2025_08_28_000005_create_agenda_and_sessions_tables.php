<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // agenda_slots
    // -------------------------
    Schema::create('agenda_slots', function (Blueprint $table) {
      $table->id();
      $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
      $table->foreignId('room_id')->constrained()->cascadeOnDelete();
      $table->foreignId('doctor_id')->constrained()->restrictOnDelete();
      $table->date('date');
      $table->time('start_time');
      $table->time('end_time');
      $table->boolean('is_available')->default(true)->index();
      $table->timestamps();
      $table->unique(['room_id', 'date', 'start_time'], 'slot_unique_room_start');
      $table->index(['doctor_id', 'date', 'start_time']);
    });

    // -------------------------
    // appointments
    // -------------------------
    Schema::create('treatment_sessions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('treatment_id')->constrained()->cascadeOnDelete();
      $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('doctor_id')->constrained()->restrictOnDelete();
      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $table->foreignId('session_type_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
      $table->unsignedTinyInteger('session_number');
      $table->unsignedTinyInteger('month_session_number');
      $table->date('date');
      $table->time('time');
      $table->unsignedSmallInteger('duration')->default(45);
      $table->enum('status', ['Programada', 'Completada', 'Cancelada', 'No Asistió'])->default('Programada')->index();

      // Evaluación & notas
      $table->unsignedTinyInteger('pain_before')->nullable();
      $table->unsignedTinyInteger('pain_after')->nullable();
      $table->unsignedSmallInteger('rom_flexion')->nullable();
      $table->unsignedSmallInteger('rom_rotation')->nullable();
      $table->unsignedSmallInteger('rom_abduction')->nullable();
      $table->json('techniques')->nullable();
      $table->json('exercises')->nullable();
      $table->json('meta')->nullable()->comment('Datos adicionales en formato JSON');
      $table->text('notes')->nullable();
      $table->text('homework')->nullable();
      $table->text('next_goals')->nullable();

      // —— “Snapshot” de tarifa aplicada ——

      $table->unsignedBigInteger('patient_amount_clp')->nullable(); // precio cobrado al paciente
      $table->unsignedBigInteger('doctor_amount_clp')->nullable();  // parte del doctor
      $table->unsignedBigInteger('clinic_amount_clp')->nullable();  // parte de la clínica

      $table->timestamps();
      $table->softDeletes();

      // No repetir Nº dentro del tratamiento
      /* $table->unique(['treatment_id', 'session_number'], 'ts_treatment_number_unique');  */ // no repetir Nº dentro del tratamiento

      // Búsquedas comunes
      $table->index(['patient_id', 'date', 'time'], 'ts_patient_date_time_idx');
      $table->index(['doctor_id', 'date', 'time'], 'ts_kine_date_time_idx');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('treatment_sessions');
    Schema::dropIfExists('agenda_slots');
  }
};
