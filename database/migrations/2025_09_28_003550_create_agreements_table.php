<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Define el tarifario maestro de tu clínica para una aseguradora específica.
        Schema::create('agreements', function (Blueprint $table) {
            $table->id();

            // 🛡️ MULTI-EMPRESA (CRÍTICO)
            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnDelete()
                ->comment('Llave foránea a la empresa dueña de este tarifario.');
            
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete()
                ->comment('Sucursal específica (opcional si el tarifario varía por sede).');

            // 🤝 RELACIÓN CON LA ASEGURADORA
            $table->foreignId('insurance_id')
                ->constrained('insurances') // Tu tabla 'insurances'
                ->cascadeOnDelete()
                ->comment('Aseguradora (Isapre, Fonasa) a la que aplica este tarifario.');
            
            // --- DETALLES ---
            $table->string('name')->comment('Nombre del tarifario (ej: Tarifa 2025 - Colmena).');
            $table->string('version', 20)->nullable()->comment('Versión interna del tarifario.');
            $table->boolean('is_active')->default(true)->index();
            $table->date('start_date')->comment('Fecha de inicio de vigencia del tarifario.');
            $table->date('end_date')->nullable()->comment('Fecha de fin de vigencia del tarifario.');

            $table->timestamps();
            
            // Índice para asegurar que una empresa no tenga dos convenios activos iguales
            $table->unique(['company_id', 'insurance_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreements');
    }
};