<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
      public function up(): void
      {
            Schema::create('receivables', function (Blueprint $table) {
                  $table->id();
                  $table->foreignId('company_id')->constrained();

                  // Relación Polimórfica con el Cliente (Paciente, Empresa, Cliente Genérico)
                  $table->morphs('customer');

                  // Relación con el Documento de Origen (Invoice)
                  $table->foreignId('invoice_id')->constrained()->comment('Documento que generó la deuda');

                  $table->decimal('amount_total', 12, 0)->comment('Monto original de la deuda');
                  $table->decimal('amount_paid', 12, 0)->default(0)->comment('Lo que ya han pagado');
                  $table->decimal('balance', 12, 0)->comment('Saldo pendiente (Total - Pagado)');

                  $table->date('due_date')->comment('Fecha de vencimiento');
                  $table->enum('status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');

                  $table->timestamps();
            });

            // Tabla historial de abonos
            Schema::create('receivable_payments', function (Blueprint $table) {
                  $table->id();
                  $table->foreignId('receivable_id')->constrained()->cascadeOnDelete();
                  $table->decimal('amount', 12, 0);
                  $table->date('payment_date');
                  $table->string('payment_method'); // cash, transfer, etc.
                  $table->string('reference')->nullable();
                  $table->text('notes')->nullable();
                  $table->foreignId('user_id')->constrained(); // Quién recibió el dinero
                  $table->timestamps();
            });
      }

      public function down(): void
      {
            Schema::dropIfExists('receivable_payments');
            Schema::dropIfExists('receivables');
      }
};
