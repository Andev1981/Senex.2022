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

      // Agregamos estas dos para que el Seeder y las consultas rápidas funcionen
      $t->foreignId('company_id')->constrained()->cascadeOnDelete();
      $t->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();

      /* $t->foreignId('session_type_id')->nullable()->constrained(); */
      $t->foreignId('treatment_session_id')->nullable()->constrained();
      $t->foreignId('agreement_rule_id')->nullable()->constrained();
      $t->nullableMorphs('sellable'); // Permite nulos para ítems manuales

      $t->string('description');
      $t->integer('quantity')->default(1);

      // Precios Unitarios (Homologados)
      $t->integer('unit_price_clp')->comment('Precio bruto unitario (100%)');
      $t->integer('unit_patient_clp')->default(0)->comment('Copago por unidad');
      $t->integer('unit_insurance_primary_clp')->default(0);
      $t->integer('unit_insurance_secondary_clp')->default(0);

      // Totales de Línea
      $t->integer('total_gross_clp')->comment('unit_price_clp * quantity');
      $t->integer('total_patient_clp')->comment('unit_patient_clp * quantity');

      // Indicador IVA
      $t->boolean('is_exento')->default(true)->comment('Define si el ítem es exento o afecto');


      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('invoice_items');
  }
};
