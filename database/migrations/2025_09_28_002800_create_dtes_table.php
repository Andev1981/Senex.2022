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
        Schema::create('dtes', function (Blueprint $table) {
            $table->id();
            
            // --- LLAVES DE SEGREGACIÓN ---
            $table->foreignId('company_id')
                  ->constrained() // Asume que la tabla 'companies' existe
                  ->onDelete('cascade')
                  ->comment('Empresa emisora del DTE (Multi-tenancy).');
            
            $table->foreignId('branch_id')
                  ->nullable()
                  ->constrained() // Asume que la tabla 'branches' existe
                  ->onDelete('set null')
                  ->comment('Sucursal donde se originó el DTE.');

            // --- DATOS PRINCIPALES DEL DTE ---
            $table->unsignedSmallInteger('type')->comment('Código DTE (ej: 33, 39, 61).');
            $table->unsignedInteger('folio')->comment('Número correlativo de la empresa.');
            
            $table->string('rut_emisor', 10)->comment('RUT de la empresa (sin DV ni guion).');
            $table->string('rut_receptor', 10)->comment('RUT del receptor (sin DV ni guion).');
            
            $table->decimal('total_monto', 12, 2)->comment('Monto total del documento.');
            
            // --- SEGUIMIENTO SII ---
            $table->enum('estado_sii', ['PENDIENTE', 'ENVIADO', 'ACEPTADO', 'RECHAZADO', 'ACEPTADO_CON_REPAROS'])
                  ->default('PENDIENTE');
            $table->bigInteger('track_id')->nullable()->unique()->comment('Número de seguimiento del SII.');
            $table->mediumText('glosa_rechazo')->nullable()->comment('Detalle del error si fue rechazado por el SII.');

            // --- ARCHIVOS Y RELACIONES ---
            $table->mediumText('xml_data')->nullable()->comment('Contenido XML del DTE firmado.');
            
            $table->foreignId('related_dte_id')
                  ->nullable()
                  ->constrained('dtes')
                  ->onDelete('set null')
                  ->comment('ID de un DTE relacionado (ej. factura original para NC).');
            
            // Índice para asegurar unicidad por empresa y tipo.
            $table->unique(['company_id', 'type', 'folio']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dtes');
    }
};