<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        // Tabla de transacciones de uso de bonos
        Schema::create('voucher_transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
            
            $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
            
            // Relación con el pago/sesión que consumió el bono
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            
            // FK a la sesión
            $table->foreignId('treatment_session_id')
                ->constrained('treatment_sessions')->cascadeOnDelete();
            
            // Tipo de transacción
            $table->enum('transaction_type', [
                'activation',     // Activación inicial del bono
                'usage',          // Uso del bono en un pago
                'refund',         // Devolución al bono
                'transfer',       // Transferencia a otro paciente
                'expiration',     // Expiración automática
                'cancellation'    // Cancelación manual
            ])->index();
            
            // Montos de la transacción
            $table->unsignedBigInteger('amount_clp')->default(0); // Monto en CLP
            $table->unsignedInteger('sessions_used')->default(0); // Sesiones consumidas
            
            // Saldos después de la transacción
            $table->unsignedBigInteger('balance_before')->default(0);
            $table->unsignedBigInteger('balance_after')->default(0);
            $table->unsignedInteger('sessions_before')->default(0);
            $table->unsignedInteger('sessions_after')->default(0);
            
            // Información adicional
            $table->text('description')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            // Índices
            $table->index(['voucher_id', 'created_at']);
            $table->index(['payment_id']);
            $table->index(['treatment_session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_transactions');
     
    }
};
