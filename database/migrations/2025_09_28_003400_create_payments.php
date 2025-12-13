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

      // ===== RELACIONES =====
      $t->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $t->foreignId('branch_id')
                      ->nullable()
                      ->constrained('branches')
                      ->nullOnDelete();
      $t->foreignId('liquidation_payor_id')->constrained()->onDelete('cascade');
      /* $t->foreignId('treatment_id')->nullable()->constrained()->nullOnDelete(); */
      /* $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete(); */

      // ===== DATOS BÁSICOS DEL PAGO =====
      $t->date('payment_date')->index();
      $t->string('transaction_reference')->nullable()->comment('Referencia general del pago');

      // ===== MONTOS EN CLP (ENTEROS) =====
      $t->unsignedBigInteger('amount_clp')->comment('Total cobrado');
      /* $t->unsignedBigInteger('copay_clp')->default(0)->comment('Copago paciente'); */
      /* $t->unsignedBigInteger('insurance_covered_clp')->default(0)->comment('Cubierto por isapre/seguro'); */

      // ===== MÉTODO Y ESTADO DEL PAGO =====
      $t->enum('payment_method', [
        'webpay_credit',
        'webpay_debit',
        'webpay_prepaid',
        'cash',
        'transfer',
        'check',
        'voucher',
        'other'
      ])->default('cash');
      
      $t->enum('status', [
        'pending', 
        'completed', 
        'failed', 
        'refunded', 
        'void'
      ])->default('pending')->index();
      
      $t->dateTime('paid_at')->nullable();

      // ===== CAMPOS ESPECÍFICOS DE WEBPAY =====
      // Token único de la transacción Webpay
      $t->string('webpay_token', 64)->nullable()->unique()->index()
        ->comment('Token único de Webpay (token_ws)');
      
      // Buy Order - Identificador de orden de compra
      $t->string('webpay_buy_order', 26)->nullable()->index()
        ->comment('Identificador de orden de compra');
      
      // Session ID usado en Webpay
      $t->string('webpay_session_id', 61)->nullable()
        ->comment('Session ID usado en la transacción');
      
      // Código de autorización de la transacción
      $t->string('webpay_authorization_code', 6)->nullable()
        ->comment('Código de autorización (cuando es exitosa)');
      
      // Tipo de pago usado (VD=débito, VN=crédito, etc)
      $t->string('webpay_payment_type_code', 2)->nullable()
        ->comment('VD=Débito, VN=Crédito, VC=Cuotas, VP=Prepago, etc');
      
      // Código de respuesta (0=exitoso, otros=error)
      $t->integer('webpay_response_code')->nullable()
        ->comment('0=Éxito, otros códigos indican error');
      
      // Número de cuotas (si aplica)
      $t->unsignedInteger('webpay_installments')->nullable()
        ->comment('Número de cuotas (si pago en cuotas)');
      
      // Detalles de la tarjeta (últimos 4 dígitos)
      $t->json('webpay_card_detail')->nullable()
        ->comment('Detalles enmascarados de tarjeta: {card_number: "****1234"}');
      
      // Fecha y hora de la transacción en Webpay
      $t->timestamp('webpay_transaction_date')->nullable()->index()
        ->comment('Timestamp de la transacción en Transbank');
      
      // Respuesta completa de Webpay (para auditoría)
      $t->json('webpay_raw_response')->nullable()
        ->comment('Respuesta completa del commit (auditoría)');

      // ===== OTROS CAMPOS =====
      // Folio de factura/boleta (si se emitió DTE)
      $t->string('invoice', 20)->nullable()->unique();
      
      // Notas adicionales
      $t->text('notes')->nullable();
      
      // Timestamps
      $t->timestamps();
      $t->softDeletes();

      // ===== ÍNDICES PARA OPTIMIZACIÓN =====
      // Búsquedas comunes en dashboard financiero
      $t->index(['patient_id', 'status'], 'payments_patient_status_idx');
      
      // Búsquedas de transacciones Webpay
      $t->index(['webpay_buy_order', 'status'], 'payments_webpay_order_status_idx');
      
      // Búsquedas por fecha de transacción
      $t->index(['webpay_transaction_date'], 'payments_webpay_trx_date_idx');
      
      // Búsquedas por método de pago
      $t->index(['payment_method', 'payment_date'], 'payments_method_date_idx');
      $t->index(['branch_id']);
    });

  }

  public function down(): void
  {

    Schema::dropIfExists('payments');
  }
};
