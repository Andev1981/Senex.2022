<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            // ===== RELACIONES =====
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('patient_id')->constrained()->cascadeOnDelete();

            // Reemplazamos liquidation_payor_id por insurance_id para ser consistentes con los otros modelos
            $t->foreignId('liquidation_insurance_id')->nullable()->constrained('insurances')->nullOnDelete()
                ->comment('Seguro primario involucrado en la transacción');

            // ===== MONTOS HOMOLOGADOS (Sincronizados con Frontend final_shares) =====
            // amount_clp será el "amount_patient_clp" (lo que efectivamente entró a caja)
            $t->bigInteger('amount_clp')->default(0)->comment('Monto final pagado por el paciente (Copago)');

            // Auditoría de montos totales
            $t->bigInteger('amount_gross_clp')->default(0)->comment('Total bruto de la atención (100%)');
            $t->bigInteger('amount_insurance_primary_clp')->default(0)->comment('Cobertura Isapre/Fonasa');
            $t->bigInteger('amount_insurance_secondary_clp')->default(0)->comment('Cobertura Seguro Complementario');
            $t->bigInteger('discount_clp')->default(0)->comment('Descuento aplicado');

            // ===== DATOS DEL PAGO =====
            $t->date('payment_date')->index();
            $t->string('transaction_reference')->nullable()->comment('Referencia general o voucher');

            $t->enum('payment_method', [
                'pos_integrado',
                'webpay',
                'cash',
                'transfer',
            ])->default('cash');

            $t->enum('status', [
                'pending',
                'completed',
                'failed',
                'refunded',
                'void'
            ])->default('pending')->index();

            $t->dateTime('paid_at')->nullable();

            // ===== CAMPOS ESPECÍFICOS DE WEBPAY (Mantenemos tu estructura pro) =====
            $t->string('webpay_token', 64)->nullable()->unique()->index();
            $t->string('webpay_buy_order', 26)->nullable()->index();
            $t->string('webpay_session_id', 61)->nullable();
            $t->string('webpay_authorization_code', 10)->nullable();
            $t->string('webpay_payment_type_code', 2)->nullable();
            $t->integer('webpay_response_code')->nullable();
            $t->unsignedInteger('webpay_installments')->nullable();
            $t->json('webpay_card_detail')->nullable();
            $t->json('webpay_raw_response')->nullable();

            // ===== METADATOS Y AUDITORÍA =====
            $t->json('metadata')->nullable()->comment('Contiene el snapshot del carrito services_to_bill');

            $t->timestamps();
            $t->softDeletes();

            // Índices
            $t->index(['company_id', 'branch_id']);
            $t->index(['patient_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
