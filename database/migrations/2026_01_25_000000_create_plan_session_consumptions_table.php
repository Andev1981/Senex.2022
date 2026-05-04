<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_session_consumptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_plan_id')->constrained('patient_plans')->cascadeOnDelete();
            $table->foreignId('treatment_session_id')->constrained('treatment_sessions')->cascadeOnDelete();
            
            $table->integer('sessions_consumed')->default(1);
            $table->dateTime('consumed_at');
            
            $table->integer('session_price')->nullable()->comment('Precio de la sesión al momento del consumo (opcional)');
            $table->text('notes')->nullable();

            $table->timestamps();

            // Índices para búsquedas frecuentes
            $table->index(['patient_plan_id', 'consumed_at']);
            // Unicidad: un patient_plan no puede consumir la misma treatment_session dos veces
            $table->unique(['patient_plan_id', 'treatment_session_id'], 'unique_plan_session_consumption');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_session_consumptions');
    }
};
