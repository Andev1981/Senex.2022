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

        $t->foreignId('session_type_id')->nullable()->constrained();
        $t->foreignId('treatment_session_id')->nullable()->constrained();
        $t->foreignId('agreement_item_id')->nullable()->constrained();

        $t->string('description');
        $t->integer('quantity')->default(1);
        
        // Precios Unitarios (Homologados)
        $t->integer('unit_price')->comment('Precio bruto unitario (100%)');
        $t->integer('unit_patient')->default(0)->comment('Copago por unidad');
        $t->integer('unit_insurance_primary')->default(0);
        $t->integer('unit_insurance_secondary')->default(0);

        // Totales de Línea
        $t->integer('total_gross')->comment('unit_price * quantity');
        $t->integer('total_patient')->comment('unit_patient * quantity');
        
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
