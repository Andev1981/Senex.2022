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
        Schema::create('company_patient', function (Blueprint $table) {
            $table->id();

            // Llaves Foráneas (Parte de la llave única compuesta)
            $table->foreignId('company_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->comment('ID de la clínica que registró o atiende al paciente.');

            $table->foreignId('patient_id')
                  ->constrained() // Asume que la tabla 'patients' existe
                  ->onDelete('cascade')
                  ->comment('ID del paciente único.');

            // Datos específicos de la relación clínica-paciente
            $table->string('ficha_clinica_local_id')->nullable()->comment('ID de la ficha clínica específica para esta compañía.');
            $table->timestamp('fecha_primer_contacto')->nullable();
            
            // Restricción: Un paciente solo puede estar registrado una vez por la misma compañía.
            $table->unique(['company_id', 'patient_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_patient');
    }
};