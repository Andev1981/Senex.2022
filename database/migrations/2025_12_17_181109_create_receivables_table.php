<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('receivables', function (Blueprint $table) {
            $table->id();
            
            // --- CONTEXTO ---
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            
            // --- RELACIONES CLAVE ---
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete()
                  ->comment('Referencia al copago del paciente');
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_id')->constrained()->cascadeOnDelete()
                  ->comment('La institución que debe el dinero');

            // --- LÓGICA DE COBRO ---
            $table->enum('insurance_type', ['primary', 'secondary'])
                  ->default('primary')
                  ->index()
                  ->comment('Identifica si es Isapre/Fonasa o Seguro Complementario');

            $table->integer('amount_clp')->default(0);
            $table->string('external_transaction_code')->nullable()->index()
                  ->comment('Folio I-Med o código de autorización del seguro');

            // --- ESTADOS Y FECHAS ---
            $table->string('status', 20)->default('pending')->index()
                  ->comment('pending, settled, void');
            
            $table->date('due_date')->nullable()
                  ->comment('Fecha estimada de pago por parte del seguro');
            $table->datetime('settled_at')->nullable()
                  ->comment('Fecha real en que el seguro pagó la deuda');

            $table->text('notes')->nullable();
            
            $table->softDeletes();
            $table->timestamps();

            // --- ÍNDICES PARA REPORTERÍA ---
            // Útil para conciliación: "¿Cuánto nos debe X seguro este mes?"
            $table->index(['insurance_id', 'status', 'created_at'], 'idx_receivables_conciliacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receivables');
    }
};