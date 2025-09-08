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
    Schema::create('payment_transactions', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete(); // patients.id
      $t->foreignId('treatment_session_id')->nullable()
        ->constrained('treatment_sessions')->nullOnDelete(); // treatment_sessions.id (nullable)

      $t->decimal('amount', 12, 2);
      $t->enum('payment_method', ['webpay', 'cash', 'transfer', 'insurance', 'other']);
      $t->enum('status', ['pending', 'completed', 'failed', 'refunded', 'void'])->default('pending');
      $t->dateTime('paid_at')->nullable();
      $t->char('currency', 3)->default('CLP');
      $t->string('provider_txn_id', 191)->nullable();
      $t->json('provider_payload')->nullable();
      $t->text('notes')->nullable();
      $t->timestamps();
    });

    // -------------------------
    // debts
    // -------------------------
    Schema::create('debts', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      // FK SIMPLE
      $t->foreignId('treatment_session_id')
        ->constrained('treatment_sessions')->cascadeOnDelete(); // si borras la sesión, borras la deuda

      $t->decimal('original_amount', 12, 2);
      $t->decimal('paid_amount', 12, 2)->default(0);
      $t->enum('status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');
      $t->date('due_date')->nullable();
      $t->unsignedSmallInteger('payment_reminders_sent')->default(0);
      $t->timestamps();
    });

    // -------------------------
    // payment_allocations
    // -------------------------
    Schema::create('payment_allocations', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      // FKs SIMPLES
      $t->foreignId('payment_transaction_id')
        ->constrained('payment_transactions')->cascadeOnDelete();

      $t->foreignId('debt_id')->nullable()
        ->constrained('debts')->nullOnDelete();

      // NOTA: la FK a invoices se agrega después (como dijiste)
      $t->foreignId('invoice_id')->nullable();

      $t->decimal('amount', 12, 2);
      $t->timestamps();
    });

    // -------------------------
    // webhook_events
    // -------------------------
    Schema::create('webhook_events', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();

      $t->string('provider', 100);
      $t->string('event_type', 100);
      $t->string('idempotency_key', 191);
      $t->json('payload')->nullable();
      $t->dateTime('processed_at')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('webhook_events');
    Schema::dropIfExists('payment_allocations');
    Schema::dropIfExists('debts');
    Schema::dropIfExists('payment_transactions');
  }
};
