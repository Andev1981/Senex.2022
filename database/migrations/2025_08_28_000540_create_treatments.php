<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->comment('Empresa dueña');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            
            // Actores
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete(); // Kine responsable
            
            // Configuración
            $table->foreignId('item_id')->constrained('items'); // Tipo por defecto
            $table->foreignId('plan_id')->nullable()->constrained();

            // ------------------------------------------------
            // 1. ORIGEN Y DERIVACIÓN (NUEVO)
            // ------------------------------------------------
            $table->string('referral_doctor_name')->nullable()->comment('Médico que deriva');
            $table->string('referral_diagnosis')->nullable()->comment('Diagnóstico de la orden médica');
            $table->date('referral_date')->nullable();

            // ------------------------------------------------
            // 2. DIAGNÓSTICO KINESIOLÓGICO
            // ------------------------------------------------
            // Tu lógica de FK a diagnostics
            $table->string('diagnostic_code', 10)->nullable();
            $table->foreign('diagnostic_code')->references('code')->on('diagnostics')->nullOnDelete();

            $table->json('additional_diagnoses')->nullable()->comment('Comorbilidades secundarias');
            
            // CLAVE KINE: ¿Qué duele y dónde?
            $table->string('body_part')->nullable()->comment('knee, shoulder, spine, etc.');
            $table->enum('laterality', ['left', 'right', 'bilateral', 'midline', 'n/a'])->nullable();
            
            $table->text('description')->nullable(); // Motivo de consulta detallado

            // ------------------------------------------------
            // 3. ESTADO Y EVOLUCIÓN
            // ------------------------------------------------
            $table->enum('status', ['evaluation', 'in_progress', 'cancelled', 'paused', 'completed'])->default('evaluation')->index();
            $table->enum('current_phase', ['evaluation', 'acute', 'subacute', 'rehab', 'discharge'])->default('evaluation');
            
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Línea Base (Antes)
            $table->unsignedTinyInteger('initial_pain_level')->nullable()->comment('EVA 0-10 Inicial');
            $table->json('initial_pain_map')->nullable()->comment('Coordenadas X/Y dolor inicial');
            $table->json('objectives')->nullable();

            // Resultados (Después)
            $table->text('outcome')->nullable();
            $table->enum('discharge_reason', ['success', 'abandonment', 'medical_referral', 'insurance_limit'])->nullable();
            
            // KPIs
            $table->unsignedTinyInteger('pain_reduction')->default(0);
            $table->unsignedTinyInteger('mobility_improvement')->default(0);
            $table->unsignedTinyInteger('strength_gain')->default(0);

            // Logística
            $table->unsignedInteger('total_sessions')->nullable();
            $table->unsignedInteger('completed_sessions')->default(0);
            $table->unsignedTinyInteger('frequency')->default(0);
            $table->enum('frequency_time', ['day', 'week', 'month'])->nullable();
            $table->boolean('is_indefinite')->default(false);
            
            $table->dateTime('next_appointment')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treatments');
    }
};