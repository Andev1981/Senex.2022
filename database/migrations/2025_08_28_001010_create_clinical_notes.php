<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

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
  }

  public function down(): void
  {
    Schema::dropIfExists('clinical_notes');
  }
};
