<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // payment_transactions
    // -------------------------
    Schema::create('payments', function (Blueprint $t) {
      $t->id();

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $t->foreignId('treatment_id')->nullable()->constrained()->nullOnDelete();
      $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete();

      $t->date('payment_date')->index();
      $t->string('transaction_reference')->nullable();

      // Dinero en CLP (enteros)
      $t->unsignedBigInteger('amount_clp');                // total cobrado
      $t->unsignedBigInteger('copay_clp')->default(0);     // copago paciente
      $t->unsignedBigInteger('insurance_covered_clp')->default(0); // cubierto por isapre/seguro

      $t->enum('payment_method', ['webpay_credit','webpay_debit', 'cash', 'transfer', 'paycheck', 'other']);
      $t->enum('status', ['pending', 'completed', 'failed', 'refunded', 'void'])->default('pending');
      $t->dateTime('paid_at')->nullable();


      // Opcional: mantener folio simple aquí también
      $t->string('invoice')->nullable()->unique();

      $t->text('notes')->nullable();
      $t->timestamps();
      $t->softDeletes();

      // Búsquedas comunes en dashboard financiero
      $t->index(['patient_id', 'status'], 'payments_patient_status_idx');
    });

    // -------------------------
    // debts
    // -------------------------
    Schema::create('debts', function (Blueprint $t) {
      $t->id();

      $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
      // FK SIMPLE
      $t->foreignId('treatment_session_id')
        ->constrained('treatment_sessions')->cascadeOnDelete(); // si borras la sesión, borras la deuda

      $t->unsignedBigInteger('original_amount');
      $t->unsignedBigInteger('paid_amount')->default(0);
      $t->enum('status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');
      $t->date('due_date')->nullable();
      $t->unsignedSmallInteger('payment_reminders_sent')->default(0);
      $t->timestamps();

      $t->index(['patient_id', 'status'], 'debts_patient_status_idx');
    });

    // -------------------------
    // payment_allocations
    // -------------------------
    Schema::create('payment_allocations', function (Blueprint $t) {
      $t->id();
      $t->foreignId('payment_id')->constrained()->cascadeOnDelete();
      $t->foreignId('debt_id')->nullable()->constrained()->cascadeOnDelete();
      $t->foreignId('invoice_id')->nullable()->constrained()->cascadeOnDelete();

      $t->unsignedBigInteger('amount');
      $t->timestamps();

      $t->unique(['payment_id', 'debt_id'], 'allocations_unique_payment_debt');
    });

    // -------------------------
    // webhook_events
    // -------------------------
    Schema::create('webhook_events', function (Blueprint $t) {
      $t->id();
      $t->string('provider', 50); // webpay, flow, ...
      $t->string('event_type', 100);
      $t->string('idempotency_key', 100);
      $t->json('payload');
      $t->timestamp('processed_at')->useCurrent();
      $t->timestamps();

      $t->index(['provider', 'event_type', 'processed_at'], 'webhooks_provider_event_idx');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('webhook_events');
    Schema::dropIfExists('payment_allocations');
    Schema::dropIfExists('debts');
    Schema::dropIfExists('payments');
  }
};
