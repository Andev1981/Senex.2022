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
      $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
      $table->foreignId('insurance_id')->nullable()->constrained();

      // Polimorfismo para el Receptor (Patient o Company)
      $table->string('entity_type');
      $table->unsignedBigInteger('entity_id');
      $table->index(['entity_type', 'entity_id']);

      // --- BLOQUE 2: MONTOS CONTABLES (PARA EL SII) ---
      $table->integer('amount_neto_clp')->default(0)->comment('Monto afecto a IVA');
      $table->integer('amount_exento_clp')->default(0)->comment('Monto exento de IVA (Salud)');
      $table->integer('amount_iva_clp')->default(0)->comment('19% del Neto');
      $table->integer('amount_total_clp')->default(0)->comment('Suma final legal');

      // --- BLOQUE 3: DESGLOSE CLÍNICO (COPAGO) ---
      $table->integer('amount_gross_clp')->default(0)->comment('Valor arancel total de la prestación');
      $table->integer('amount_insurance_primary_clp')->default(0)->comment('Aporte Fonasa/Isapre');
      $table->integer('amount_insurance_secondary_clp')->default(0)->comment('Aporte Seguro Complementario');
      $table->integer('amount_patient_clp')->default(0)->comment('Lo que efectivamente pagó el paciente');

      // --- BLOQUE 4: DATOS TRIBUTARIOS (DTE CHILE) ---
      $table->integer('dte_type')->index()->comment('33, 34, 39, 41, 61');
      $table->bigInteger('dte_folio')->nullable()->index()->comment('Número entregado por el SII');
      $table->date('issue_date')->index();
      $table->string('dte_status')->default('pending')->comment('pending, accepted, rejected');
      /* $table->string('dte_track_id')->nullable()->comment('ID de seguimiento SII'); */
      /*  $table->longText('dte_xml')->nullable(); */
      $table->string('pdf_path')->nullable()->comment('Ruta al archivo de respaldo físico');

      // --- BLOQUE 5: ESTADOS INTERNOS Y AUDITORÍA ---
      $table->string('payment_status')->default('unpaid')->comment('paid, unpaid, voided');
      
      // Detalle de Pagos
      $table->string('transaction_number')->nullable()->comment('N° de operación/comprobante');
      $table->date('transaction_date')->nullable();
      $table->integer('global_discount_clp')->default(0)->comment('Descuento global aplicado al subtotal');
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
