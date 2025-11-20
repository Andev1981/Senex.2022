<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    Schema::create('health_insurers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('rut')->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });


        Schema::create('insurance_companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('rut')->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

    // -------------------------
    // plans
    // -------------------------
    Schema::create('plans', function (Blueprint $table) {

            $table->id();
            $table->string('name');
            $table->string('codigo')->unique();
            
            // Polymorphic relationship with health_insurers or insurance_companies
            $table->enum('institution_type', ['health_insurer', 'insurance_company','clinic'])->default('clinic');
            $table->unsignedBigInteger('institution_id')->nullable();
            
            // Plan type and sessions
            $table->enum('type', ['annual', 'session_pack', 'unlimited']);
            $table->integer('total_sessions')->nullable();
            $table->integer('price');
            $table->integer('valid_months')->nullable();
            $table->text('session_types')->nullable()->comment('Allowed session type IDs');
            
            // Additional details
            $table->text('description')->nullable();
            $table->text('coverage')->nullable()->comment('Coverage details');
            
            // Validity period
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['institution_type', 'institution_id']);
            $table->index('is_active');
            $table->index('type');
    });

    // -------------------------
    // patient_plans
    // -------------------------
    Schema::create('patient_plans', function (Blueprint $t) {

      $t->id();


      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
      $t->foreignId('payment_id')->nullable()
        ->constrained('payments')->nullOnDelete();

      $t->dateTime('purchased_at');
      $t->date('expiry_date')->nullable();

      $t->date('start_date')->nullable()->comment('Fecha en que comienza la vigencia del plan');

      $t->integer('sessions_included')->nullable();
      $t->integer('sessions_used')->default(0);

      $t->enum('status', ['active', 'expired', 'exhausted', 'paused', 'cancelled'])->default('active'); // ✅ Agregué 'cancelled'

       // ✅ Campos adicionales útiles
      $t->text('notes')->nullable()->comment('Notas sobre el plan del paciente');
      $t->dateTime('paused_at')->nullable()->comment('Fecha cuando se pausó');
      $t->dateTime('cancelled_at')->nullable()->comment('Fecha de cancelación');
      $t->text('cancellation_reason')->nullable();


      $t->softDeletes(); // ✅ Agregar soft deletes por seguridad
      $t->timestamps();

      // ✅ Índices para mejorar performance
      $t->index(['patient_id', 'status']);
      $t->index(['plan_id', 'status']);
      $t->index('expiry_date');
    });

    // -------------------------
    // plan_session_consumptions
    // -------------------------
    Schema::create('plan_session_consumptions', function (Blueprint $t) {

      $t->id();

      $t->foreignId('patient_plan_id')->constrained('patient_plans')->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->constrained('treatment_sessions')->cascadeOnDelete();

      $t->integer('sessions_consumed')->default(1);
      $t->dateTime('consumed_at');

      // ✅ Campos adicionales útiles
      $t->integer('session_price')->nullable()->comment('Precio de la sesión al momento del consumo');
      $t->text('notes')->nullable()->comment('Observaciones del consumo');

      $t->timestamps();

      $t->index('patient_plan_id');
      $t->index('consumed_at');

      $t->unique(['patient_plan_id', 'treatment_session_id'], 'unique_consumption');

    });
  }

  public function down(): void
  {
    Schema::dropIfExists('insurance_companies');
    Schema::dropIfExists('health_insurers');
    Schema::dropIfExists('plans');
    Schema::dropIfExists('plan_session_consumptions');
    Schema::dropIfExists('patient_plans');
  }
};
