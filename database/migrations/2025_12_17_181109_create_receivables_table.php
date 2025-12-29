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
                  $table->foreignId('company_id')->constrained()->onDelete('cascade');
                  $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
                  
                  // Relación con el pago original (vínculo al copago y metadata)
                  $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
                  
                  // Relación con el paciente
                  $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
                  
                  // Relación con la Isapre o Seguro que debe el dinero
                  $table->foreignId('insurance_id')->nullable()->constrained()->nullOnDelete();
                  $table->string('insurance_type')->nullable()->comment('primary, secondary');

                  // Relación Polimórfica Legada (opcional para compatibilidad)
                  $table->nullableMorphs('customer');

                  // Relación con el Documento de Origen (Invoice)
                  $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete()->comment('Documento que generó la deuda');

                  $table->bigInteger('amount_clp')->default(0);
                  $table->string('external_transaction_code')->nullable()->comment('Folio I-Med');

                  $table->decimal('amount_total', 12, 0)->nullable()->comment('Monto original de la deuda (Legado)');
                  $table->decimal('amount_paid', 12, 0)->default(0)->comment('Lo que ya han pagado');
                  $table->decimal('balance', 12, 0)->nullable()->comment('Saldo pendiente');

                  $table->date('due_date')->nullable()->comment('Fecha de vencimiento');
                  $table->timestamp('settled_at')->nullable()->comment('Fecha de liquidación');
                  $table->enum('status', ['pending', 'partial', 'paid', 'overdue', 'settled', 'void'])->default('pending');
                  
                  $table->text('notes')->nullable();
                  $table->softDeletes();
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