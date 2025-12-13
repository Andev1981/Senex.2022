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
        Schema::create('diagnostics', function (Blueprint $table) {
            // Usamos el código CIE-10 como clave primaria, ya que es el identificador único
            $table->string('code', 10)->primary()->comment('Código de diagnóstico CIE-10 (Ej: M54.5)');
            
            // Descripción completa del diagnóstico
            $table->string('description', 255)->comment('Descripción del diagnóstico según CIE-10.');
            
            // Opcional: Para manejar versiones futuras o códigos que ya no se usan
            $table->string('version', 10)->default('ICD-10');
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // Índice en la descripción para búsquedas rápidas
            $table->index('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostics');
    }
};
