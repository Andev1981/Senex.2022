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
      $t->engine = 'InnoDB';

      $t->id();


      // FKs simples
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
      $t->foreignId('session_type_id')->constrained('session_types')->cascadeOnDelete();

      $t->enum('commission_type', ['percentage', 'fixed_amount']);
      $t->decimal('commission_value', 12, 2);
      $t->date('effective_from');
      $t->date('effective_until')->nullable();
      $t->boolean('is_active')->default(true);
      $t->text('notes')->nullable();
      $t->timestamps();
    });

    // -------------------------
    // payrolls
    // -------------------------
    Schema::create('payrolls', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      // FK simple
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();

      $t->date('period_start');
      $t->date('period_end');
      $t->integer('total_sessions')->default(0);
      $t->decimal('total_patient_amount', 12, 2)->default(0);
      $t->decimal('total_doctor_amount', 12, 2)->default(0);
      $t->decimal('total_clinic_amount', 12, 2)->default(0);
      $t->enum('status', ['draft', 'approved', 'paid'])->default('draft');
      $t->dateTime('paid_at')->nullable();
      $t->timestamps();
    });

    // -------------------------
    // payroll_details
    // -------------------------
    Schema::create('payroll_details', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      // FKs simples
      $t->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->constrained('treatment_sessions')->restrictOnDelete();

      $t->string('session_type_name');
      $t->decimal('patient_amount', 12, 2);
      $t->decimal('doctor_amount', 12, 2);
      $t->decimal('commission_rate', 12, 2);
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('payroll_details');
    Schema::dropIfExists('payrolls');
    Schema::dropIfExists('doctor_commission_rates');
  }
};
