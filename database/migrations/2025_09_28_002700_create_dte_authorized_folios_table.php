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
        Schema::create('authorized_folios', function (Blueprint $table) {
            $table->id();
            
            // Datos del CAF
            $table->string('rut_emisor', 12)->comment('RUT del emisor al que se le autorizó el CAF.');
            $table->unsignedSmallInteger('tipo_dte')->comment('Tipo de DTE (ej: 33 para Factura Electrónica).');
            $table->unsignedInteger('folio_desde')->comment('Primer folio autorizado en el rango.');
            $table->unsignedInteger('folio_hasta')->comment('Último folio autorizado en el rango.');
            
            // Dato clave para la asignación: debe ser transaccional.
            $table->unsignedInteger('ultimo_folio_usado')->default(0)->comment('El último folio consumido y asignado.');
            
            // Datos administrativos
            $table->longText('caf_xml')->comment('Contenido XML completo del CAF.');
            $table->date('fecha_vencimiento')->nullable();
            $table->boolean('activo')->default(true);
            
            // Índices para optimizar la búsqueda y el bloqueo por RUT/TipoDTE
            $table->unique(['rut_emisor', 'tipo_dte', 'folio_desde', 'folio_hasta'], 'caf_unique_range');
            $table->index(['rut_emisor', 'tipo_dte', 'activo']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('authorized_folios');
    }
};