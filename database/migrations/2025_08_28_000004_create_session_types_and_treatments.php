<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // session_types (PADRE)
    // -------------------------
    Schema::create('session_types', function (Blueprint $table) {
      $table->id(); // BIGINT UNSIGNED AI
      $table->string('name', 120)->unique();
      $table->decimal('base_price', 12, 2)->default(0);
      $table->unsignedSmallInteger('duration_minutes')->default(45);
      $table->boolean('plan_eligible')->default(true);
      $table->unsignedInteger('plan_session_value')->default(1);
      $table->boolean('active')->default(true)->index();
      $table->timestamps();
      $table->softDeletes();
    });

    // -------------------------
    // treatments (HIJA)
    // -------------------------
    Schema::create('treatments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('session_type_id')->constrained()->cascadeOnDelete();
      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete(); // referente
      $table->string('name', 150);
      $table->string('diagnosis');
      $table->text('description')->nullable();
      $table->date('start_date');
      $table->date('end_date')->nullable();
      $table->enum('status', ['Activo', 'Completado', 'Suspendido'])->default('Activo')->index();
      $table->unsignedTinyInteger('total_sessions');
      $table->unsignedTinyInteger('completed_sessions')->default(0);
      $table->string('frequency')->nullable();
      $table->string('current_phase')->nullable();
      $table->json('objectives')->nullable();
      $table->text('outcome')->nullable();
      $table->dateTime('next_appointment')->nullable();

      // KPIs
      $table->unsignedTinyInteger('pain_reduction')->default(0);
      $table->unsignedTinyInteger('mobility_improvement')->default(0);
      $table->unsignedTinyInteger('strength_gain')->default(0);

      $table->timestamps();
      $table->softDeletes();
      $table->index(['patient_id', 'status']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('treatments');
    Schema::dropIfExists('session_types');
  }
};
