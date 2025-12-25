<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // session_types (PADRE)
    // -------------------------
    Schema::create('session_types', function (Blueprint $table) {
      $table->id(); // BIGINT UNSIGNED AI
      $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
      /* $table->foreignId('branch_id')
                      ->nullable()
                      ->constrained('branches')
                      ->nullOnDelete(); */
      // ===== 1. IDENTIFICACIÓN Y CATEGORÍA =====
      $table->string('name', 120)->unique();
      $table->string('code', 20)->nullable()->unique()->comment('Código arancelario de Isapre/Fonasa/Interno.');
      $table->enum('category', ['kinesiology', 'evaluation', 'procedure', 'massage', 'other'])->index();

      // ===== 2. PRECIOS Y DURACIÓN =====
      $table->unsignedBigInteger('base_price_clp') // 🎯 Mejorado: Sufijo CLP para claridad
        ->default(0)
        ->comment('Precio base del servicio en pesos chilenos (CLP) como entero.');
      $table->unsignedSmallInteger('duration_minutes')->default(45);

      $table->unsignedInteger('default_doctor_commission_clp')->default(0);

      // ===== 3. REGLAS CLÍNICAS Y DE COBERTURA =====
      $table->boolean('requires_diagnosis')->default(true)->comment('TRUE si necesita un diagnóstico (CIE-10) para facturar.');
      $table->boolean('requires_referral')->default(false)->comment('TRUE si requiere orden médica para cobro a terceros.');

      // 🎯 Campo 'plan_eligible' es muy genérico, lo reemplazamos por el valor de descuento:
      $table->unsignedBigInteger('plan_discount_clp')->default(0)->comment('Monto de descuento estándar aplicado si se usa un paquete de sesiones.');

      // Eliminamos 'plan_session_value', ya que la liquidación se calcula con el % del plan.

      // ===== 4. ESTADO Y AUDITORÍA =====
      // 🎯 Corrección: Eliminamos la columna 'active' duplicada.
      $table->boolean('is_active')->default(true)->index();
      $table->timestamps();
      $table->softDeletes();
    });
  }

  public function down(): void
  {

    Schema::dropIfExists('session_types');
  }
};
