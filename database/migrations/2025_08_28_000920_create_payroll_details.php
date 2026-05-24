<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // payroll_details
    // -------------------------
    Schema::create('payroll_details', function (Blueprint $t) {
      $t->id();

      $t->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');

      // FKs simples
      $t->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();

      // Enlaza al origen del ítem (p.ej. attendance, invoice_item, etc.)
      $t->nullableMorphs('source'); // source_type + source_id

      // Redundamos referencias útiles para reportes
      $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete();
      $t->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
      $t->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
      $t->foreignId('item_id')->nullable()->constrained()->nullOnDelete();

      // Fechas y estado del servicio
      $t->date('service_date')->nullable();
      $t->boolean('attended')->default(true);

      // Transparencia Clínica (Nuevos campos Fase 3)
      $t->string('diagnostic_code', 20)->nullable();
      $t->string('diagnostic_name')->nullable();
      $t->string('service_category')->nullable();
      $t->integer('weight')->default(3)->comment('Peso operativo: 3 (Individual), 1 (Grupal)');

      // Montos en CLP
      $t->unsignedBigInteger('patient_amount_clp')->default(0);    // cobrado al paciente/base
      $t->unsignedBigInteger('commission_base_clp')->default(0);   // base sobre la que se calculó
      $t->unsignedBigInteger('commission_amount_clp')->default(0); // comisión del doctor
      $t->unsignedBigInteger('adjustment_amount_clp')->default(0); // bono/descuento por ítem
      $t->unsignedBigInteger('subtotal_clp')->default(0);          // commission + adjustment

      // Traza de cómo se calculó (para auditoría)
      $t->enum('rate_type', ['fixed_amount', 'percentage'])->nullable();
      $t->unsignedBigInteger('rate_amount_clp')->nullable(); // si fijo
      $t->decimal('rate_percentage', 5, 2)->nullable();  // si %
      $t->json('calc_context')->nullable();              // snapshot de reglas/condiciones

      $t->text('notes')->nullable();
      $t->timestamps();

      $t->index(['payroll_id', 'doctor_id']);
      $t->index(['service_date', 'item_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('payroll_details');
  }
};
