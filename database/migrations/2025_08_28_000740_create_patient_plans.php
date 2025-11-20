<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

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
  }

  public function down(): void
  {
    Schema::dropIfExists('patient_plans');
  }
};
