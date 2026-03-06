<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('invoices', function (Blueprint $table) {
      $table->id();

      // --- BLOQUE 1: IDENTIDAD Y RELACIONES ---
      $table->foreignId('company_id')->constrained()->onDelete('cascade');
      $table->foreignId('branch_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->comment('Cajero que emitió el documento');
      $table->foreignId('patient_id')->constrained()->onDelete('cascade');
      $table->foreignId('insurance_id')->nullable()->constrained();

      // Polimorfismo para el Receptor (Patient o Company)
      $table->string('entity_type');
      $table->unsignedBigInteger('entity_id');
      $table->index(['entity_type', 'entity_id']);

      // --- BLOQUE 2: MONTOS CONTABLES (PARA EL SII) ---
      // Monetary Amounts (English Professional Naming)
      $table->bigInteger('net_amount_clp')->default(0)->comment('Amount subject to VAT');
      $table->bigInteger('exempt_amount_clp')->default(0)->comment('Amount exempt from VAT');
      $table->bigInteger('vat_amount_clp')->default(0)->comment('19% VAT amount');
      $table->bigInteger('total_amount_clp')->default(0)->comment('Final legal total amount');

      // --- BLOQUE 3: DESGLOSE CLÍNICO (COPAGO) ---
      $table->bigInteger('amount_gross_clp')->default(0)->comment('Valor arancel total de la prestación');
      $table->bigInteger('amount_insurance_primary_clp')->default(0)->comment('Aporte Fonasa/Isapre');
      $table->bigInteger('amount_insurance_secondary_clp')->default(0)->comment('Aporte Seguro Complementario');
      $table->bigInteger('amount_patient_clp')->default(0)->comment('Lo que efectivamente pagó el paciente');

      $table->string('dte_status')->default('pending')->comment('pending, accepted, rejected, error, etc.');
      $table->unsignedSmallInteger('dte_type')->nullable()->comment('33, 34, 39, 41, 61');
      $table->unsignedInteger('dte_folio')->nullable()->comment('Número correlativo legal');
      $table->date('issue_date')->nullable()->comment('Fecha de emisión legal');
      $table->mediumText('dte_xml')->nullable()->comment('Contenido XML del documento');
      $table->string('pdf_path')->nullable()->comment('Ruta al archivo de respaldo físico');

      // --- BLOQUE 5: ESTADOS INTERNOS Y AUDITORÍA ---
      $table->string('payment_status')->default('unpaid')->comment('paid, unpaid, partial, voided');
      $table->string('transaction_number')->nullable()->comment('N° de operación/comprobante');
      $table->date('transaction_date')->nullable();
      $table->bigInteger('global_discount_clp')->default(0)->comment('Descuento global aplicado al subtotal');
      $table->text('observations')->nullable();

      $table->json('metadata')->nullable();

      $table->timestamps();
      $table->softDeletes();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('invoices');
  }
};
