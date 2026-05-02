<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('treatment_sessions', function (Blueprint $table) {
            $table->id();

            // Contexto
            $table->foreignId('company_id')->constrained();
            $table->foreignId('branch_id')->nullable()->constrained();
            $table->foreignId('treatment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('doctor_id')->constrained('doctors'); // Profesional que atendió
            
            $table->foreignId('item_id')->nullable()->constrained('items');
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();

            // Logística
            $table->date('date')->index();
            $table->time('time')->nullable();
            $table->string('status', 20)->default('scheduled')->index(); // scheduled, checked_in, in_progress, completed, etc.
            $table->boolean('consumes_plan')->default(true);
            $table->unsignedTinyInteger('month_session_number')->default(0)->comment('Número de sesión del mes');
            $table->unsignedTinyInteger('duration')->default(45)->comment('Tiempo de duracion de la sesión');

            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('started_at')->nullable();


            // -----------------------------------------------------
            // ESTRUCTURA SOAP (CLÍNICA)
            // -----------------------------------------------------
            
            // [S]ubjective
            $table->text('subjective')->nullable()->comment('S: Relato del paciente');
            $table->unsignedTinyInteger('pain_level')->nullable()->comment('EVA Hoy (0-10)');

            // [O]bjective
            $table->text('objective')->nullable()->comment('O: Texto libre de procedimientos');
            $table->json('evaluation_data')->nullable()->comment('Mediciones: ROM, Fuerza');
            $table->json('session_pain_map')->nullable()->comment('Si el dolor cambió de lugar hoy');
            $table->json('activities_data')->nullable()->comment('Ejercicios realizados hoy');
            $table->json('attachments')->nullable()->comment('Fotos/Docs de la sesión');

            // [A]ssessment
            $table->text('assessment')->nullable()->comment('A: Análisis profesional');

            // [P]lan
            $table->text('plan')->nullable()->comment('P: Tareas y plan próxima sesión');

            // -----------------------------------------------------
            // CAMPOS ADICIONALES PARA DASHBOARD KINE (Compatibilidad)
            // -----------------------------------------------------
            $table->unsignedTinyInteger('pain_before')->nullable();
            $table->unsignedTinyInteger('pain_after')->nullable();
            
            $table->unsignedSmallInteger('rom_flexion_before')->nullable();
            $table->unsignedSmallInteger('rom_flexion_after')->nullable();
            $table->unsignedSmallInteger('rom_abduction_before')->nullable();
            $table->unsignedSmallInteger('rom_abduction_after')->nullable();
            $table->unsignedSmallInteger('rom_rotation_before')->nullable();
            $table->unsignedSmallInteger('rom_rotation_after')->nullable();

            $table->json('techniques')->nullable();
            $table->json('exercises')->nullable();

            $table->text('notes')->nullable();
            $table->text('homework')->nullable();
            $table->text('next_goals')->nullable();

            // -----------------------------------------------------
            // FINANZAS
            // -----------------------------------------------------
            $table->unsignedBigInteger('patient_amount_clp')->default(0);
            $table->unsignedBigInteger('doctor_amount_clp')->default(0);
            $table->unsignedBigInteger('clinic_amount_clp')->default(0);
            $table->json('cost_breakdown')->nullable();
            $table->boolean('is_exento')->default(true);
            $table->boolean('dte_generated')->default(false);

            $table->text('cancellation_note')->nullable();
            
            // Firma Digital y Validación de Atención
            $table->string('signature_path')->nullable();
            $table->boolean('signature_skipped')->default(false);
            $table->string('signature_skip_reason')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->string('signature_gps_coords')->nullable();

            $table->json('meta')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices extra
            $table->index(['patient_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treatment_sessions');
    }
};