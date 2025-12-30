<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {

      Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            // 🎯 Vínculo con la Compañía
            $table->foreignId('company_id')
                ->constrained('companies')
                ->onDelete('cascade');
            $table->string('name')->unique(); // Nombre de la Isapre/Aseguradora
            $table->string('rut', 12)->unique()->nullable(); // RUT de la entidad
            $table->enum('institution_type', ['health_insurer', 'insurance_company','clinic'])->default('clinic');
            $table->string('email')->nullable(); 
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);

            $table->unique(['company_id', 'name']);
            $table->unique(['company_id', 'rut']);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurances');
    }
};
