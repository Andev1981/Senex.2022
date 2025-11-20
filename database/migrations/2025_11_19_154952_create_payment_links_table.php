<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_links', function (Blueprint $table) {
            $table->id();
            
            // Token único para el enlace de pago
            $table->string('token', 64)->unique()->index();
            
            // Relaciones
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            
            // Concepto del pago
            $table->string('description', 500);
            
            // Montos
            $table->unsignedBigInteger('amount')->comment('Monto total en CLP');
            $table->boolean('allow_partial_payment')->default(false);
            $table->unsignedBigInteger('minimum_amount')->nullable()->comment('Monto mínimo si permite pago parcial');
            
            // Relaciones con sesiones/deudas (si aplica)
            $table->json('session_ids')->nullable()->comment('IDs de sesiones incluidas');
            $table->json('debt_ids')->nullable()->comment('IDs de deudas incluidas');
            
            // Estado y control
            $table->enum('status', [
                'pending',
                'paid',
                'partially_paid',
                'expired',
                'cancelled'
            ])->default('pending')->index();
            
            $table->unsignedBigInteger('paid_amount')->default(0);
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            
            // Configuración de expiración
            $table->timestamp('expires_at')->index();
            $table->timestamp('paid_at')->nullable();
            
            // Configuración de DTE
            $table->boolean('auto_issue_dte')->default(false);
            $table->unsignedSmallInteger('dte_type')->nullable()->comment('Tipo de documento: 39=Boleta, 33=Factura');
            
            // Métodos de pago permitidos para este link
            $table->json('allowed_payment_methods')->nullable()->comment('Si null, permite todos');
            
            // Contador de intentos (para seguridad)
            $table->unsignedInteger('access_count')->default(0);
            $table->unsignedInteger('max_access_count')->default(10);
            
            // Email enviado
            $table->string('recipient_email')->index();
            $table->timestamp('email_sent_at')->nullable();
            $table->unsignedInteger('email_sent_count')->default(0);
            
            // Metadatos adicionales
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices compuestos
            $table->index(['patient_id', 'status']);
            $table->index(['status', 'expires_at']);
            $table->index(['created_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_links');
    }
};
