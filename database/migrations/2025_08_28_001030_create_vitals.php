<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

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
      $t->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
      $t->unsignedSmallInteger('bp_systolic')->nullable();
      $t->unsignedSmallInteger('bp_diastolic')->nullable();
      $t->decimal('heart_rate', 5, 2)->nullable();
      $t->decimal('resp_rate', 5, 2)->nullable();
      $t->decimal('temperature_c', 4, 1)->nullable();
      $t->decimal('spo2', 5, 2)->nullable();
      $t->json('meta')->nullable();
      $t->timestamps();
    });

  }

  public function down(): void
  {
    Schema::dropIfExists('vitals');
  }
};
