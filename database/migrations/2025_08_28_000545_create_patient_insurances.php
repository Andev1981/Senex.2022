<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {

        Schema::create('patient_insurances', function (Blueprint $table) {
            $table->id();

            // 🔑 LLAVES FORÁNEAS
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_id')->constrained('insurances')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            
            // 👤 DATOS DEL AFILIADO (CRÍTICO PARA BOLETA/BONO)
            $table->string('affiliate_rut', 12)->comment('RUT del titular del plan (puede ser diferente al paciente).');
            $table->boolean('is_affiliate_holder')->default(false)->comment('Si es true, el paciente es el titular.');
            $table->boolean('is_active')->default(true)->comment('Solo un plan puede estar activo a la vez para un paciente.');
            
            // 📅 VIGENCIA Y TRAZABILIDAD
            $table->date('enrollment_date')->nullable()->comment('Fecha de inicio de afiliación.');
            $table->date('expiration_date')->nullable()->comment('Fecha de término del plan.');
            
            $table->timestamps();

            // Índice para unicidad: un paciente no puede tener el mismo plan dos veces (mientras esté activo)
            $table->unique(['patient_id', 'insurance_id', 'plan_id', 'is_active'], 'unique_active_plan');
            $table->index(['patient_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_insurances');
    }
};
