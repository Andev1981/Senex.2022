<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // treatments (HIJA)
    // -------------------------
    Schema::create('treatments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
      $table->foreignId('branch_id')
      ->nullable()
      ->constrained('branches')
      ->nullOnDelete();
      $table->foreignId('session_type_id')->constrained()->cascadeOnDelete();
      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $table->foreignId('plan_id')
          ->nullable() 
          ->constrained('plans')
          ->after('patient_id');
      $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete(); // referente
      // 🎯 1. CREAR LA COLUMNA ANTES DE USARLA EN LA FK 🎯
        $table->string('diagnostic_code', 10) // Usamos 'diagnostic_code' para mayor claridad
              ->nullable(); // Ajusta la posición si es necesario
              
        // 🎯 2. CREAR LA RESTRICCIÓN DE CLAVE FORÁNEA (CORRECTO)
        $table->foreign('diagnostic_code') // Referenciamos la columna que acabamos de crear
              ->references('code')
              ->on('diagnostics')
              ->nullOnDelete();

      $table->text('description')->nullable();
      $table->date('start_date')->nullable();
      $table->date('end_date')->nullable();
      $table->enum('status', ['evaluation','in_progress','cancelled','paused','completed'])->default('Evaluation')->nullable()->index();
      $table->unsignedTinyInteger('total_sessions')->nullable();
      $table->unsignedTinyInteger('completed_sessions')->default(0)->nullable();
      $table->unsignedTinyInteger('frequency')->default(0)->nullable();
     /*  $table->string('frequency_time')->nullable(); */
      $table->enum('frequency_time',['day','week','month'])->nullable();
      $table->boolean('is_indefinite')->default(false);
      $table->enum('current_phase',['evaluation', 'acute_symptomatic', 'functional_restoration','maintenance_prevention', 'discharge'])->default('evaluation')->nullable()->index();
      $table->json('objectives')->nullable();
      $table->text('outcome')->nullable();
      $table->dateTime('next_appointment')->nullable();

      // KPIs
      $table->unsignedTinyInteger('pain_reduction')->default(0)->nullable();
      $table->unsignedTinyInteger('mobility_improvement')->default(0)->nullable();
      $table->unsignedTinyInteger('strength_gain')->default(0)->nullable();

      $table->timestamps();
      $table->softDeletes();
      $table->index(['patient_id', 'status']);
      $table->index('branch_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('session_types');
  }
};
