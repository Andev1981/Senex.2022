<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Nombre de la tabla pivote por convención de Laravel
        Schema::create('company_doctor', function (Blueprint $table) {
            $table->id();

            // Llaves Foráneas (Parte de la llave única compuesta)
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade')
                ->comment('ID de la empresa/clínica que tiene el convenio.');

            $table->foreignId('doctor_id')
                ->constrained() // Asume que la tabla 'doctors' existe
                ->onDelete('cascade')
                ->comment('ID del doctor/profesional.');

            // Datos específicos del convenio
            $table->decimal('tarifa_acordada_clp', 10, 2)->nullable()->comment('Tarifa pactada con esta empresa.');
            $table->unsignedDecimal('porcentaje_comision', 5, 2)->default(0.00)->comment('Porcentaje de comisión para la liquidación de esta empresa.');
            $table->enum('estado_convenio', ['activo', 'inactivo', 'pendiente'])->default('activo');

            // Restricción: Un doctor solo puede tener una relación con una empresa
            $table->unique(['company_id', 'doctor_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_doctor');
    }
};
