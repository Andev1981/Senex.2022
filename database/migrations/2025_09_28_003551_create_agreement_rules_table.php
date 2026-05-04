<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Detalle de la cobertura/precio por servicio dentro de un tarifario (Agreement).
        Schema::create('agreement_rules', function (Blueprint $table) {
            $table->id();

            // 🔗 RELACIONES
            $table->foreignId('agreement_id')
                ->constrained()
                ->cascadeOnDelete()
                ->comment('FK al tarifario maestro.');

            $table->foreignId('item_id')
                ->constrained('items')
                ->cascadeOnDelete()
                ->comment('FK al servicio o prestación de salud.');

            $table->foreignId('plan_id')
                ->nullable()
                ->constrained('plans') // Tu tabla 'plans'
                ->nullOnDelete()
                ->comment('Plan específico (ej: Fonasa B). Null si aplica a todos los planes de esa aseguradora.');

            // --- VALORES DE COBERTURA (SIMULACIÓN IMED) ---
            $table->unsignedBigInteger('gross_price_clp')->comment('Precio bruto de la prestación (100%).');

            // 🎯 Estos son los valores que reemplazarán la respuesta de I-Med
            $table->unsignedBigInteger('patient_share_clp')->comment('Monto fijo de copago que paga el paciente.');
            $table->unsignedBigInteger('insurance_share_clp')->comment('Monto fijo de cobertura que paga la aseguradora.');

            // Porcentajes de cobertura (opcional, para flexibilidad)
            $table->decimal('patient_percentage', 5, 2)->default(0)->comment('Porcentaje de cobertura del paciente.');
            $table->decimal('insurance_percentage', 5, 2)->default(0)->comment('Porcentaje de cobertura de la aseguradora.');

            $table->text('notes')->nullable()->comment('Notas');

            $table->timestamps();

            // Índice para búsqueda rápida: dado un tarifario y un servicio, dame la regla.
            $table->unique(['agreement_id', 'item_id', 'plan_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreement_rules');
    }
};
