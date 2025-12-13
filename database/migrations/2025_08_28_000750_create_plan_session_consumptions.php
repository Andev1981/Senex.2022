<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // plan_session_consumptions
    // -------------------------
    Schema::create('plan_session_consumptions', function (Blueprint $t) {

      $t->id();

      $t->foreignId('patient_insurance_id')->constrained('patient_insurances')->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->constrained('treatment_sessions')->cascadeOnDelete();

      $t->integer('sessions_consumed')->default(1);
      $t->dateTime('consumed_at');

      // ✅ Campos adicionales útiles
      $t->integer('session_price')->nullable()->comment('Precio de la sesión al momento del consumo');
      $t->text('notes')->nullable()->comment('Observaciones del consumo');

      $t->timestamps();

      $t->index('patient_insurance_id');
      $t->index('consumed_at');

      $t->unique(['patient_insurance_id', 'treatment_session_id'], 'unique_consumption');

    });
  }

  public function down(): void
  {
    Schema::dropIfExists('plan_session_consumptions');
  }
};
