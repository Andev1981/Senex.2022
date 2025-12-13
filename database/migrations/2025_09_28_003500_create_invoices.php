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

    // -------------------------
    // CAMPOS DE IDENTIFICACIÓN Y SEGUIMIENTO DTE (CORREGIDOS)
    // -------------------------
    
    // Tipo de DTE (ej. 33) - Combinado e Indexado
    $t->unsignedSmallInteger('dte_type')->nullable()->index()->comment('Tipo de DTE emitido (ej: 33, 39).');
    
    // Folio DTE - Único, Numérico (Asumimos que el folio es un número y la combinación lo hace único)
    $t->unsignedInteger('dte_folio')->nullable()->comment('Folio asignado por el CAF.'); 
    
    // Fecha de Emisión
    $t->date('issue_date')->index();

    // Seguimiento SII
    $t->string('dte_track_id', 20)->nullable()->index()->comment('ID de seguimiento del envío al SII.');
    $t->string('dte_status', 15)->default('PENDIENTE')->comment('Estado: PENDIENTE, ENVIADO, ACEPTADO, RECHAZADO, etc.');

    // Contenido XML
    $t->longText('dte_xml')->nullable()->comment('Contenido XML del DTE final timbrado y firmado.');

    // -------------------------
    // TOTALES EN CLP (CORREGIDOS)
    // -------------------------
    $t->unsignedBigInteger('net_clp')->default(0);
    $t->unsignedBigInteger('iva_clp')->default(0);
    $t->unsignedBigInteger('total_clp')->default(0);

    // Metadatos (para guardar la respuesta cruda del SII, p.ej.)
    $t->json('metadata')->nullable()->comment('Respuesta/track de la emisión DTE.');

    $t->timestamps();

    // -------------------------
    // ÍNDICES FINALES
    // -------------------------
    // Índice de unicidad para la combinación Tipo DTE + Folio
    $t->unique(['dte_type', 'dte_folio'], 'dte_unique_folio');
    
    // Consultas típicas
    $t->index(['company_id', 'issue_date'], 'invoices_company_issue_idx');
    $t->index(['branch_id', 'issue_date']);
});
  }

  public function down(): void
  {
    Schema::dropIfExists('invoices');
  }
};
