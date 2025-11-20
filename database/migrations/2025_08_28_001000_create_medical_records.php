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

  }

  public function down(): void
  {
    Schema::dropIfExists('medical_records');
  }
};
