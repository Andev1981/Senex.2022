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
        Schema::create('plan_session_type', function (Blueprint $table) {
            $table->id();
            
            // Relación con el Plan
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            
            // Relación con el Tipo de Sesión
            $table->foreignId('session_type_id')->constrained()->onDelete('cascade');
            
            // Cantidad de sesiones incluidas (ej: 10). Null podría ser ilimitado.
            $table->integer('max_sessions')->default(1);
            
            $table->timestamps();

            // Evitar duplicados del mismo tipo de sesión en un mismo plan
            $table->unique(['plan_id', 'session_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_session_type');
    }
};
