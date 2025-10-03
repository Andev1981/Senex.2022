<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // company_settings
    // -------------------------
    Schema::create('companies', function (Blueprint $t) {
      $t->id();
      $t->string('rut', 12)->unique();          // normalizado (sin puntos, con guión)
      $t->string('business_name');             // Razón social
      $t->string('giro')->nullable();
      $t->string('email')->nullable();
      $t->string('phone', 30)->nullable();
      $t->timestamps();
    });

    // -------------------------
    // invoices
    // -------------------------
    Schema::create('invoices', function (Blueprint $t) {
      $t->id();
      $t->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
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
    });

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
    Schema::dropIfExists('invoices');
    Schema::dropIfExists('companies');
  }
};
