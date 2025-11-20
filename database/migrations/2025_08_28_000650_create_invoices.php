<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // -------------------------
    // invoices
    // -------------------------
    Schema::create('invoices', function (Blueprint $t) {
      $t->id();
      $t->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
      $t->foreignId('branch_id')
                      ->nullable()
                      ->constrained('branches')
                      ->nullOnDelete();
      $t->foreignId('patient_id')->nullable()->constrained()->cascadeOnDelete();
      $t->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();

      $t->unsignedSmallInteger('dte_type')->index(); // 33 (Factura), 39 (Boleta), 41 (Boleta Exenta), etc.
      $t->string('folio')->unique();                 // folio DTE
      $t->date('issue_date')->index();

      // Totales en CLP (enteros)
      $t->unsignedBigInteger('net_clp')->default(0);
      $t->unsignedBigInteger('iva_clp')->default(0);
      $t->unsignedBigInteger('total_clp')->default(0);

      $t->json('metadata')->nullable();              // respuesta/track LibreDTE
      $t->timestamps();

      // Consultas típicas: por empresa/fecha o por folio
      $t->index(['company_id', 'issue_date'], 'invoices_company_issue_idx');
      $t->index(['branch_id','issue_date']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('invoices');
  }
};
