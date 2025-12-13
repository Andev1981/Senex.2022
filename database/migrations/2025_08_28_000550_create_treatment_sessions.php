<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // appointments
    // -------------------------
    Schema::create('treatment_sessions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
      $table->foreignId('treatment_id')->constrained()->cascadeOnDelete();
      $table->foreignId('room_id')
                      ->nullable()
                      ->constrained('rooms')
                      ->nullOnDelete();
      $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('doctor_id')->constrained()->restrictOnDelete();
      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $table->foreignId('session_type_id')->nullable()->constrained()->nullOnDelete();
      $table->unsignedTinyInteger('month_session_number')->default(1);
      $table->date('date');
      $table->time('time')->nullable();
      $table->unsignedSmallInteger('duration')->default(45);
      $table->enum('status', ['scheduled', 'completed', 'cancelled', 'not_attend','in_proggress'])->default('scheduled')->index();

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
      $table->text('cancellation_note')->nullable();

      // —— “Snapshot” de tarifa aplicada ——

      $table->unsignedBigInteger('patient_amount')->nullable(); // precio cobrado al paciente
      $table->unsignedBigInteger('doctor_amount')->nullable();  // parte del doctor
      $table->unsignedBigInteger('clinic_amount')->nullable();  // parte de la clínica

      $table->timestamps();
      $table->softDeletes();



      // Búsquedas comunes
      $table->index(['patient_id', 'date', 'time'], 'ts_patient_date_time_idx');
      $table->index(['doctor_id', 'date', 'time'], 'ts_kine_date_time_idx');
      $table->index(['company_id', 'date']);
      $table->index('room_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('treatment_sessions');
  }
};


/* Error al crear el tratamiento. SQLSTATE[HY000]: General error: 1364 Field 'original_amount' doesn't have a default value (Connection: mysql, SQL: insert into `debts` (`patient_id`, `treatment_session_id`, `updated_at`, `created_at`) values (1, 82, 2025-11-29 15:32:28, 2025-11-29 15:32:28)) */