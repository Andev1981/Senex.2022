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
        Schema::create('dte_configurations', function (Blueprint $table) {
           $table->id();

           $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');

            // Clave única para la empresa (RUT sin guion, para mejor compatibilidad)
            $table->string('rut_empresa', 10)->unique()->comment('RUT de la empresa sin dígito verificador ni guion.'); 
            
            // Credenciales del Certificado PFX
            $table->string('certificado_path')->comment('Ruta física al archivo .pfx del certificado digital.');
            
            // IMPORTANTE: Almacenar la contraseña cifrada. Usar 'text' o 'string' de largo suficiente.
            $table->text('certificado_password')->comment('Contraseña del certificado PFX (DEBE ser cifrada en la aplicación).');
            
            // Ambiente de operación
            $table->enum('ambiente', ['homologacion', 'produccion'])->default('homologacion');

            // Datos de Caducidad (para gestión de alertas)
            $table->timestamp('fecha_caducidad')->nullable()->comment('Fecha de caducidad del certificado PFX.');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dte_configurations');
    }
};
