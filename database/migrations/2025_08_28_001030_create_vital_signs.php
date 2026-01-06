<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vital_signs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            // ------------------------------------------------
            // 1. POLIMORFISMO (VINCULACIÓN)
            // ------------------------------------------------
            // Esto crea 'source_type' y 'source_id'
            // source_type podrá ser 'App\Models\TreatmentSession' o 'PhysicalAssessment'
            $table->morphs('source'); 

            // ------------------------------------------------
            // 2. CONTEXTO
            // ------------------------------------------------
            $table->timestamp('recorded_at')->useCurrent();
            $table->string('context')->default('resting')->comment('resting, active, recovery, intake');

            // ------------------------------------------------
            // 3. MÉTRICAS (Dinámicas)
            // ------------------------------------------------
            $table->unsignedSmallInteger('bp_systolic')->nullable();
            $table->unsignedSmallInteger('bp_diastolic')->nullable();
            $table->decimal('heart_rate', 5, 2)->nullable();
            $table->decimal('resp_rate', 5, 2)->nullable();
            $table->decimal('spo2', 5, 2)->nullable(); // Saturación
            $table->decimal('temperature_c', 4, 1)->nullable();
            
            // Antropometría (Opcional por sesión)
            $table->unsignedSmallInteger('height_cm')->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('bmi', 5, 2)->nullable();

            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vital_signs');
    }
};