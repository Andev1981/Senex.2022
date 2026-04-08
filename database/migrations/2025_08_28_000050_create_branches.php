<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('branches', function (Blueprint $table) {
      $table->id();
      $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
      $table->string('codigo_sucursal_sii', 120);
      $table->string('name', 120);
      $table->string('phone', 30)->nullable();
      $table->string('email')->nullable();
      $table->boolean('is_main')->default(false)->comment('Indica si es la Casa Matriz');
      $table->boolean('is_home_care_only')->default(false)->comment('Atención exclusiva a domicilio');
      $table->boolean('active')->default(true)->index();
      $table->timestamps();
      $table->index(['id']); // soporte a FKs compuestas
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('branches');
  }
};
