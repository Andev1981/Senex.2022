<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_user', function (Blueprint $table) {
            $table->id();

            // Relación con el usuario
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Relación con la sucursal
            $table->foreignId('branch_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Campo para definir si es su sucursal principal o por defecto
            $table->boolean('is_main')->default(false);

            // Índices para que las consultas de permisos sean ultra rápidas
            $table->unique(['user_id', 'branch_id']); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_user');
    }
};
