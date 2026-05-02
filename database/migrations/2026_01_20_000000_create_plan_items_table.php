<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_items', function (Blueprint $table) {
            $table->id();
            
            // Relación con el Plan
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            
            // Relación con el Ítem (Servicio)
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            
            // Cantidad de sesiones incluidas (ej: 10). Null podría ser ilimitado.
            $table->integer('max_sessions')->default(1);
            
            $table->timestamps();

            // Evitar duplicados del mismo ítem en un mismo plan
            $table->unique(['plan_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_items');
    }
};
