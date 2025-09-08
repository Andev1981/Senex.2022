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
    Schema::create('company_settings', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();

      $t->string('business_name');
      $t->string('rut', 20);
      $t->string('address')->nullable();
      $t->string('city', 100)->nullable();
      $t->string('region', 100)->nullable();
      $t->string('economic_activity_code', 20)->nullable();
      $t->unsignedTinyInteger('tax_rate')->default(19);
      $t->string('sii_resolution_number', 50)->nullable();
      $t->date('sii_resolution_date')->nullable();
      $t->json('invoice_api_credentials')->nullable();
      $t->json('webpay_credentials')->nullable();
      $t->timestamps();
    });

    // -------------------------
    // invoices
    // -------------------------
    Schema::create('invoices', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      $t->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
      $t->foreignId('treatment_session_id')->nullable()->constrained('treatment_sessions')->nullOnDelete();

      // se completará con FK simple más adelante (cuando exista patient_plans)
      $t->unsignedBigInteger('patient_plan_id')->nullable();

      $t->enum('type', ['boleta', 'factura', 'nota_credito', 'nota_debito']);
      $t->string('document_number', 50)->nullable();
      $t->date('issue_date');
      $t->decimal('subtotal', 12, 2);
      $t->decimal('tax_amount', 12, 2)->default(0);
      $t->decimal('total_amount', 12, 2);
      $t->enum('sii_status', ['pending', 'sent', 'accepted', 'rejected'])->default('pending');
      $t->string('sii_track_id', 100)->nullable();
      $t->string('pdf_path')->nullable();
      $t->string('xml_path')->nullable();
      $t->enum('status', ['draft', 'issued', 'paid', 'cancelled'])->default('draft');
      $t->json('meta')->nullable();
      $t->timestamps();
    });

    // -------------------------
    // invoice_items
    // -------------------------
    Schema::create('invoice_items', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      $t->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();

      $t->string('description');
      $t->foreignId('session_type_id')->nullable()->constrained('session_types')->nullOnDelete();

      $t->integer('quantity')->default(1);
      $t->decimal('unit_price', 12, 2);
      $t->decimal('discount_amount', 12, 2)->default(0);
      $t->decimal('line_total', 12, 2);
      $t->boolean('tax_exempt')->default(false);
      $t->string('sii_item_code', 50)->nullable();
      $t->timestamps();
    });

    // -------------------------
    // completar FK en payment_allocations -> invoices (simple, sin DBAL)
    // -------------------------
    // 1) Asegura columna y tipo con SQL crudo (evita ->change() y DBAL)
    if (!Schema::hasColumn('payment_allocations', 'invoice_id')) {
      Schema::table('payment_allocations', function (Blueprint $t) {
        $t->unsignedBigInteger('invoice_id')->nullable();
      });
    } else {
      // Forzamos BIGINT UNSIGNED NULL con ALTER (no requiere DBAL)
      DB::statement('ALTER TABLE `payment_allocations` MODIFY `invoice_id` BIGINT UNSIGNED NULL');
    }

    // 2) Elimina cualquier FK previa que toque invoice_id (simple o compuesta)
    $dbName = DB::getDatabaseName();
    $fks = DB::select("
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payment_allocations' AND COLUMN_NAME = 'invoice_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ", [$dbName]);

    foreach ($fks as $fk) {
      $name = $fk->CONSTRAINT_NAME;
      DB::statement("ALTER TABLE `payment_allocations` DROP FOREIGN KEY `{$name}`");
    }

    // 3) Crea la FK simple con nombre explícito
    Schema::table('payment_allocations', function (Blueprint $t) {
      $t->foreign('invoice_id', 'fk_payment_allocations_invoice_id')
        ->references('id')->on('invoices')
        ->nullOnDelete(); // ON DELETE SET NULL
    });
  }

  public function down(): void
  {
    // Quita la FK simple en payment_allocations si existe
    try {
      DB::statement('ALTER TABLE `payment_allocations` DROP FOREIGN KEY `fk_payment_allocations_invoice_id`');
    } catch (\Throwable $e) {
      // ignorar si no existe
    }

    Schema::dropIfExists('invoice_items');
    Schema::dropIfExists('invoices');
    Schema::dropIfExists('company_settings');
  }
};
