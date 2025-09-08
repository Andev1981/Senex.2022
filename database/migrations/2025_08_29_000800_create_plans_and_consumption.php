<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // plans
    // -------------------------
    Schema::create('plans', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      $t->string('name');
      $t->enum('type', ['annual', 'session_pack', 'unlimited']);
      $t->integer('total_sessions')->nullable();
      $t->decimal('price', 12, 2);
      $t->integer('valid_months')->nullable();
      $t->json('session_types')->nullable(); // IDs permitidos
      $t->boolean('is_active')->default(true);
      $t->timestamps();
    });

    // -------------------------
    // patient_plans
    // -------------------------
    Schema::create('patient_plans', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
      $t->foreignId('payment_transaction_id')->nullable()
        ->constrained('payment_transactions')->nullOnDelete();

      $t->dateTime('purchased_at');
      $t->date('expiry_date')->nullable();
      $t->integer('sessions_included')->nullable();
      $t->integer('sessions_used')->default(0);
      $t->enum('status', ['active', 'expired', 'exhausted', 'paused'])->default('active');
      $t->timestamps();
    });

    // -------------------------
    // plan_session_consumptions
    // -------------------------
    Schema::create('plan_session_consumptions', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();


      $t->foreignId('patient_plan_id')->constrained('patient_plans')->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->constrained('treatment_sessions')->cascadeOnDelete();

      $t->integer('sessions_consumed')->default(1);
      $t->dateTime('consumed_at');
      $t->timestamps();
    });

    // -------------------------
    // Completar FK en invoices -> patient_plan_id (simple, sin DBAL)
    // -------------------------
    // 1) Asegura que la columna exista y tenga el tipo correcto
    if (!Schema::hasColumn('invoices', 'patient_plan_id')) {
      Schema::table('invoices', function (Blueprint $t) {
        $t->unsignedBigInteger('patient_plan_id')->nullable()->after('treatment_session_id');
      });
    } else {
      // Forzar BIGINT UNSIGNED NULL con SQL (evita ->change() y DBAL)
      DB::statement('ALTER TABLE `invoices` MODIFY `patient_plan_id` BIGINT UNSIGNED NULL');
    }

    // 2) Eliminar cualquier FK previa que toque patient_plan_id (simple o compuesta)
    $db = DB::getDatabaseName();
    $existing = DB::select("
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'invoices' AND COLUMN_NAME = 'patient_plan_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ", [$db]);

    foreach ($existing as $fk) {
      $name = $fk->CONSTRAINT_NAME;
      DB::statement("ALTER TABLE `invoices` DROP FOREIGN KEY `{$name}`");
    }

    // 3) Crear FK simple con nombre explícito
    Schema::table('invoices', function (Blueprint $t) {
      $t->foreign('patient_plan_id', 'fk_invoices_patient_plan_id')
        ->references('id')->on('patient_plans')
        ->nullOnDelete(); // ON DELETE SET NULL
    });
  }

  public function down(): void
  {
    // Quitar FK simple si existe
    try {
      DB::statement('ALTER TABLE `invoices` DROP FOREIGN KEY `fk_invoices_patient_plan_id`');
    } catch (\Throwable $e) {
      // ignorar si no existe
    }

    Schema::dropIfExists('plan_session_consumptions');
    Schema::dropIfExists('patient_plans');
    Schema::dropIfExists('plans');
  }
};
