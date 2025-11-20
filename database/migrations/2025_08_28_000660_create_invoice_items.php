<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // invoice_items
    // -------------------------
    Schema::create('invoice_items', function (Blueprint $t) {
      $t->id();
      $t->foreignId('invoice_id')->constrained()->cascadeOnDelete();

      // Relación opcional con sesión/tratamiento (para trazabilidad interna)
      $t->foreignId('treatment_session_id')->nullable()->constrained()->nullOnDelete();
      $t->foreignId('treatment_id')->nullable()->constrained()->nullOnDelete();

      $t->string('description');                // glosa línea
      $t->decimal('quantity', 10, 2)->default(1); // ej: "3 sesiones"
      $t->unsignedBigInteger('unit_price_clp'); // precio unitario CLP (entero)
      $t->unsignedBigInteger('total_clp');      // total de la línea (entero)

      $t->timestamps();

      $t->index(['invoice_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('invoice_items');
  }
};
