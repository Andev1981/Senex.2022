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
    Schema::create('plans', function (Blueprint $table) {

      $table->id();
      $table->foreignId('company_id')->constrained()->comment('Llave foránea a la empresa dueña de este registro.');
      $table->string('name'); // Nombre del plan (ej: Plan 3, Plan Bronce)
      $table->string('code')->unique();

      // Plan type and sessions
      $table->foreignId('insurance_id')->nullable()->constrained()->onDelete('cascade');

      $table->integer('initial_fee')->default(0)->coment('Monto de incorporación o matrícula');

      $table->enum('billing_type', ['prepaid', 'postpaid', 'membership'])->default('prepaid')->coment('prepaid (paga antes), postpaid(paga empresa dps), membership(paga descuento)');

      $table->string('insurance_policy_type')->default('complementary')->coment('Relación con seguros: complementary o standalone');

      $table->boolean('is_family')->default(false)->coment('is_family: Flag para marcar si el Plan es elegible para ser un contrato familiar');
      $table->enum('type', ['internal', 'external'])->coment('// boolean (para saber si es un producto tuyo o un convenio externo)');

      $table->integer('valid_months')->nullable();

      // Validity period
      $table->date('start_date')->nullable();
      $table->date('end_date')->nullable();


      $table->decimal('coverage_percentage', 5, 2)->nullable(); // Porcentaje cubierto por el plan (ej: 70.00)
      $table->integer('price')->nullable();

      $table->boolean('is_active')->default(true);


      $table->timestamps();
      $table->softDeletes();

      // Additional details
      $table->text('description')->nullable();

      // Indexes
      $table->index('is_active');
      $table->index('type');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('plans');
  }
};
