<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // doctor_commission_rates
    // -------------------------
    Schema::create('doctor_commission_rates', function (Blueprint $t) {
      $t->id();

      // 🎯 Seguridad Multiempresa
      $t->foreignId('company_id')->constrained()->onDelete('cascade');

      // FKs simples
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
      $t->foreignId('session_type_id')->constrained('session_types')->cascadeOnDelete();

      // Tipo de comisión: monto fijo o porcentaje
      $t->enum('commission_type', ['fixed_amount', 'percentage'])->default('fixed_amount');

      // Si 'fixed_amount' => CLP; si 'percentage' => usa 'percentage'
      $t->unsignedBigInteger('commission_value')->default(0);
      $t->decimal('commission_percentage', 5, 2)->nullable(); // 0–100.00

      // Base de cálculo (por si la comisión se calcula sobre el cobro total o base neta)
      $t->enum('base_on', ['patient_amount', 'net_base', 'custom'])->default('patient_amount');


      $t->date('effective_from');
      $t->date('effective_until')->nullable();

      $t->boolean('is_active')->default(true);

      // Metadatos
      $t->json('rules')->nullable();   // por ejemplo tramos, mínimos, topes
      $t->text('notes')->nullable();

      $t->timestamps();

      // Búsquedas típicas
      $t->index(['doctor_id', 'session_type_id']);

      // Evitar duplicados exactos por combo más fecha de inicio
      $t->unique(
        ['doctor_id', 'session_type_id', 'commission_type', 'effective_from'],
        'ucr_doctor_app_clinic_type_from'
      );
    });

  }

  public function down(): void
  {
    Schema::dropIfExists('doctor_commission_rates');
  }
};
