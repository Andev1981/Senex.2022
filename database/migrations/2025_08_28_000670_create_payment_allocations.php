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
      
      $t->foreignId('payment_id')->constrained()->cascadeOnDelete();
      $t->foreignId('debt_id')->nullable()->constrained()->cascadeOnDelete();
      $t->foreignId('invoice_id')->nullable()->constrained()->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete();

      $t->unsignedBigInteger('amount')->comment('Monto asignado de este pago');
      
      $t->timestamps();

      // Evitar duplicados
      $t->unique(['payment_id', 'debt_id'], 'allocations_unique_payment_debt');
      
      // Índices para búsquedas
      $t->index(['payment_id']);
      $t->index(['debt_id']);
      $t->index(['invoice_id']);
    });

  }

  public function down(): void
  {
    Schema::dropIfExists('payment_allocations');
  }
};
