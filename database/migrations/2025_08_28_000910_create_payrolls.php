<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // payrolls
    // -------------------------
    Schema::create('payrolls', function (Blueprint $t) {
      $t->id();

      $t->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');

      // FK simple
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();

      // Período liquidado
      $t->date('period_start');
      $t->date('period_end');

      $t->unsignedBigInteger('total_sessions')->default(0);
      $t->unsignedBigInteger('total_patient_amount_clp')->default(0);   // suma cobros base
      $t->unsignedBigInteger('total_commission_amount_clp')->default(0); // suma comisiones doctor
      $t->unsignedBigInteger('total_adjustments_clp')->default(0);       // bonos/descuentos
      $t->unsignedBigInteger('total_payable_clp')->default(0);           // neto a pagar
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
  }

  public function down(): void
  {
    Schema::dropIfExists('payrolls');
  }
};
