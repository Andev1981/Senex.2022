<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('treatment_sessions', function (Blueprint $t) {
      $t->id();

      $t->foreignId('treatment_id')->nullable()
        ->constrained('treatments')->nullOnDelete();
      $t->foreignId('appointment_id')->nullable()
        ->constrained('appointments')->nullOnDelete();
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('session_type_id')->constrained('session_types')->restrictOnDelete();

      $t->dateTime('attended_at');
      $t->enum('status', ['completed', 'cancelled'])->default('completed');
      $t->unsignedInteger('session_number')->default(0);

      $t->decimal('patient_amount', 12, 2)->default(0);
      $t->decimal('doctor_amount', 12, 2)->default(0);
      $t->decimal('clinic_amount', 12, 2)->default(0);

      $t->text('notes')->nullable();
      $t->json('meta')->nullable(); // locked=true si DTE/liquidado
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('treatment_sessions');
  }
};
