<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // payment_allocations
    // -------------------------
    Schema::create('payment_allocations', function (Blueprint $t) {
      $t->id();
      $t->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
      $t->foreignId('branch_id')
          ->nullable() // Puede ser null si es una operación central.
          ->constrained()
          ->comment('Sucursal donde se emitió el DTE.');
      $t->foreignId('payment_id')->constrained()->cascadeOnDelete();
      $t->foreignId('invoice_id')->nullable()->constrained()->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete();

      $t->unsignedBigInteger('amount_clp')->comment('Monto asignado de este pago');
      
      $t->timestamps();

      // Evitar duplicados
      $t->unique(['payment_id', 'invoice_id'], 'allocations_unique_payment_invoice');
      
      // Índices para búsquedas
      $t->index(['payment_id']);
      $t->index(['invoice_id']);
    });

  }

  public function down(): void
  {
    Schema::dropIfExists('payment_allocations');
  }
};
