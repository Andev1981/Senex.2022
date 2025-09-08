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
    Schema::create('session_types', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id(); // BIGINT UNSIGNED AI
      $t->string('name');
      $t->decimal('base_price', 12, 2)->default(0);
      $t->integer('duration_minutes')->nullable();
      $t->boolean('plan_eligible')->default(true);
      $t->unsignedInteger('plan_session_value')->default(1);
      $t->boolean('is_active')->default(true);
      $t->timestamps();
      $t->softDeletes();
    });

    // -------------------------
    // treatments (HIJA)
    // -------------------------
    Schema::create('treatments', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      // Claves foráneas SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();   // patients.id
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();     // doctors.id
      $t->foreignId('session_type_id')->nullable()
        ->constrained('session_types')->nullOnDelete();                          // session_types.id (nullable)

      $t->integer('planned_sessions')->nullable(); // NULL = indefinido
      $t->boolean('is_indefinite')->default(false);
      $t->enum('status', ['active', 'completed', 'paused'])->default('active');
      $t->date('start_date')->nullable();
      $t->date('end_date')->nullable();
      $t->text('notes')->nullable();
      $t->timestamps();
      $t->softDeletes();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('treatments');
    Schema::dropIfExists('session_types');
  }
};
