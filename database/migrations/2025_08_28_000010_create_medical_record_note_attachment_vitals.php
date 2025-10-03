<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // =========================
    // medical_records (1:1 con paciente)
    // =========================
    Schema::create('medical_records', function (Blueprint $t) {
      $t->id();

      // FK SIMPLE
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();

      $t->json('allergies')->nullable();
      $t->json('conditions')->nullable();
      $t->json('medications')->nullable();
      $t->json('surgeries')->nullable();
      $t->json('immunizations')->nullable();
      $t->json('family_history')->nullable();
      $t->json('social_history')->nullable();
      $t->json('alerts')->nullable();

      $t->string('emergency_name')->nullable();
      $t->string('emergency_phone')->nullable();
      $t->string('emergency_relation')->nullable();

      $t->text('general_notes')->nullable();
      $t->timestamps();
    });

    // =========================
    // clinical_notes
    // =========================
    Schema::create('clinical_notes', function (Blueprint $t) {
      $t->id();

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->nullable()
        ->constrained('treatment_sessions')->nullOnDelete();
      $t->foreignId('treatment_id')->nullable()
        ->constrained('treatments')->nullOnDelete();

      $t->text('subjective')->nullable();
      $t->text('objective')->nullable();
      $t->text('assessment')->nullable();
      $t->text('plan')->nullable();
      $t->json('diagnoses')->nullable();
      $t->json('procedures')->nullable();
      $t->json('goals')->nullable();
      $t->json('forms')->nullable();

      $t->boolean('is_signed')->default(false);
      $t->timestamp('signed_at')->nullable();

      // firmante
      $t->foreignId('signed_by_user_id')->nullable()
        ->constrained('users')->nullOnDelete();

      $t->json('meta')->nullable();
      $t->timestamps();
    });

    // =========================
    // medical_attachments
    // =========================
    Schema::create('medical_attachments', function (Blueprint $t) {
      $t->id();

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('clinical_note_id')->nullable()
        ->constrained('clinical_notes')->nullOnDelete();
      $t->foreignId('treatment_session_id')->nullable()
        ->constrained('treatment_sessions')->nullOnDelete();

      $t->string('title')->nullable();
      $t->string('mime_type', 100)->nullable();
      $t->unsignedBigInteger('size_bytes')->nullable();
      $t->string('storage_path');
      $t->json('tags')->nullable();
      $t->json('meta')->nullable();
      $t->timestamps();
    });

    // =========================
    // vitals
    // =========================
    Schema::create('vitals', function (Blueprint $t) {
      $t->id();

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('recorded_by_user_id')->nullable()
        ->constrained('users')->nullOnDelete();

      $t->timestamp('recorded_at')->useCurrent();

      $t->unsignedSmallInteger('height_cm')->nullable();
      $t->decimal('weight_kg', 5, 2)->nullable();
      $t->decimal('bmi', 5, 2)->nullable();
      $t->string('blood_type', 3)->nullable();
      $t->string('bp_systolic', 10)->nullable();
      $t->string('bp_diastolic', 10)->nullable();
      $t->decimal('heart_rate', 5, 2)->nullable();
      $t->decimal('resp_rate', 5, 2)->nullable();
      $t->decimal('temperature_c', 4, 1)->nullable();
      $t->decimal('spo2', 5, 2)->nullable();
      $t->json('meta')->nullable();
      $t->timestamps();
    });

    Schema::create('patient_lifestyles', function (Blueprint $table) {
      $table->id();
      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'vigorous'])->nullable();
      $table->string('sport')->nullable();
      $table->text('notes')->nullable();
      $table->date('from_date')->nullable();
      $table->date('to_date')->nullable();
      $table->enum('dominant_side', ['Right', 'Left', 'Ambidextrous'])->default('Right');
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('vitals');
    Schema::dropIfExists('medical_attachments');
    Schema::dropIfExists('clinical_notes');
    Schema::dropIfExists('medical_records');
    Schema::dropIfExists('patient_lifestyles');
  }
};
