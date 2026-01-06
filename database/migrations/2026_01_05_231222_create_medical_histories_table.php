<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_histories', function (Blueprint $table) {
            $table->id();
            
            // Relación 1 a 1 con Paciente
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            // 1. Biológicos Básicos (Movido desde Vitals)
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->enum('handedness', ['right', 'left', 'ambidextrous'])->nullable()->comment('Dominancia manual, vital para Kine');

            // 2. Hábitos
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'athlete'])->default('sedentary');
            $table->enum('smoking_status', ['never', 'former', 'current'])->default('never');
            $table->string('alcohol_consumption')->nullable(); // 'social', 'never', etc.

            // 3. JSONs Clínicos (Antecedentes)
            $table->json('pathologies')->nullable()->comment('Enfermedades crónicas (HTA, Diabetes)');
            $table->json('surgeries')->nullable()->comment('Historial quirúrgico con fechas');
            $table->json('fractures')->nullable()->comment('Historial de fracturas');
            $table->json('allergies')->nullable()->comment('Lista de alergias');
            $table->json('medications')->nullable()->comment('Fármacos actuales');

            // 4. Banderas Rojas (Seguridad para Kine)
            $table->boolean('has_pacemaker')->default(false);
            $table->boolean('has_metal_implants')->default(false);
            $table->boolean('is_pregnant')->default(false);
            $table->boolean('cancer_history')->default(false);

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_histories');
    }
};