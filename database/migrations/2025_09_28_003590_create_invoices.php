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
      $table->bigInteger('amount_neto_clp')->default(0)->comment('Monto afecto a IVA');
      $table->bigInteger('amount_exento_clp')->default(0)->comment('Monto exento de IVA (Salud)');
      $table->bigInteger('amount_iva_clp')->default(0)->comment('19% del Neto');
      $table->bigInteger('amount_total_clp')->default(0)->comment('Suma final legal');

      // --- BLOQUE 3: DESGLOSE CLÍNICO (COPAGO) ---
      $table->bigInteger('amount_gross_clp')->default(0)->comment('Valor arancel total de la prestación');
      $table->bigInteger('amount_insurance_primary_clp')->default(0)->comment('Aporte Fonasa/Isapre');
      $table->bigInteger('amount_insurance_secondary_clp')->default(0)->comment('Aporte Seguro Complementario');
      $table->bigInteger('amount_patient_clp')->default(0)->comment('Lo que efectivamente pagó el paciente');

      $table->enum('dte_status',['pending', 'accepted', 'rejected'])->default('pending')->comment('pending, accepted, rejected');
      $table->unsignedSmallInteger('dte_type')->nullable()->comment('33, 34, 39, 41, 61');
      $table->unsignedInteger('dte_folio')->nullable()->comment('Número correlativo legal');
      $table->date('issue_date')->nullable()->comment('Fecha de emisión legal');
      $table->mediumText('dte_xml')->nullable()->comment('Contenido XML del documento');
      $table->string('pdf_path')->nullable()->comment('Ruta al archivo de respaldo físico');

      // --- BLOQUE 5: ESTADOS INTERNOS Y AUDITORÍA ---
      $table->enum('payment_status',['paid', 'unpaid', 'voided'])->default('unpaid')->comment('paid, unpaid, voided');
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
