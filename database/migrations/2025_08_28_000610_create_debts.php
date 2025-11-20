<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // debts
    // -------------------------
     Schema::create('debts', function (Blueprint $t) {
      $t->id();

      $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
      
      // FK a la sesión que generó la deuda
      $t->foreignId('treatment_session_id')
        ->constrained('treatment_sessions')->cascadeOnDelete();

      $t->unsignedBigInteger('original_amount')->comment('Monto original de la deuda');
      $t->unsignedBigInteger('paid_amount')->default(0)->comment('Monto ya pagado');
      
      $t->enum('status', [
        'pending', 
        'partial', 
        'paid', 
        'overdue'
      ])->default('pending')->index();
      
      $t->date('due_date')->nullable()->index();
      $t->unsignedSmallInteger('payment_reminders_sent')->default(0);
      
      $t->timestamps();

      $t->index(['patient_id', 'status'], 'debts_patient_status_idx');
      $t->index(['due_date', 'status'], 'debts_due_date_status_idx');
    });

  }

  public function down(): void
  {
    Schema::dropIfExists('debts');
  }
};
