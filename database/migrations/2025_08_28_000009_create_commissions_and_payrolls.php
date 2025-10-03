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

    // -------------------------
    // payrolls
    // -------------------------
    Schema::create('payrolls', function (Blueprint $t) {
      $t->id();

      // FK simple
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();

      // Período liquidado
      $t->date('period_start');
      $t->date('period_end');

      $t->unsignedBigInteger('total_sessions')->default(0);
      $t->unsignedBigInteger('total_patient_amount')->default(0);   // suma cobros base
      $t->unsignedBigInteger('total_commission_amount')->default(0); // suma comisiones doctor
      $t->unsignedBigInteger('total_adjustments')->default(0);       // bonos/descuentos
      $t->unsignedBigInteger('total_payable')->default(0);           // neto a pagar
      $t->enum('status', ['draft', 'approved', 'paid', 'unpaid'])->default('draft')->index();

      // Pago
      $t->timestamp('paid_at')->nullable();
      $t->string('payment_method')->nullable();   // transferencia, efectivo, etc.
      $t->string('payment_reference')->nullable(); // folio, trx id

      $t->text('notes')->nullable();
      $t->timestamps();

      // Evita duplicar liquidaciones del mismo médico para el mismo período
      $t->unique(['doctor_id', 'period_start', 'period_end'], 'uq_payroll_doctor_period');
    });

    // -------------------------
    // payroll_details
    // -------------------------
    Schema::create('payroll_details', function (Blueprint $t) {
      $t->id();


      // FKs simples
      $t->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();

      // Enlaza al origen del ítem (p.ej. attendance, invoice_item, etc.)
      $t->nullableMorphs('source'); // source_type + source_id

      // Redundamos referencias útiles para reportes
      $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete();
      $t->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
      $t->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
      $t->foreignId('session_type_id')->nullable()->constrained()->nullOnDelete();

      // Fechas y estado del servicio
      $t->date('service_date')->nullable();
      $t->boolean('attended')->default(true);

      // Montos en CLP
      $t->unsignedBigInteger('patient_amount')->default(0);    // cobrado al paciente/base
      $t->unsignedBigInteger('commission_base')->default(0);   // base sobre la que se calculó
      $t->unsignedBigInteger('commission_amount')->default(0); // comisión del doctor
      $t->unsignedBigInteger('adjustment_amount')->default(0); // bono/descuento por ítem
      $t->unsignedBigInteger('subtotal')->default(0);          // commission + adjustment

      // Traza de cómo se calculó (para auditoría)
      $t->enum('rate_type', ['fixed_amount', 'percentage'])->nullable();
      $t->unsignedBigInteger('rate_amount')->nullable(); // si fijo
      $t->decimal('rate_percentage', 5, 2)->nullable();  // si %
      $t->json('calc_context')->nullable();              // snapshot de reglas/condiciones

      $t->text('notes')->nullable();
      $t->timestamps();

      $t->index(['payroll_id', 'doctor_id']);
      $t->index(['service_date', 'session_type_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('payroll_details');
    Schema::dropIfExists('payrolls');
    Schema::dropIfExists('doctor_commission_rates');
  }
};
