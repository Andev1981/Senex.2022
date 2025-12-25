<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('doctor_patient_assignments', function (Blueprint $t) {
            $t->id();

            // 🎯 Seguridad Multiempresa
            $t->foreignId('company_id')->constrained()->onDelete('cascade');
            $t->foreignId('branch_id')->constrained()->onDelete('cascade');
            $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();

            // Metadata útil
            $t->enum('role', ['primary', 'therapist', 'consulting', 'assistant'])->default('therapist')->index();
            $t->boolean('is_primary')->default(false)->index();
            $t->date('started_at')->nullable();
            $t->date('ended_at')->nullable(); // si se desasigna

            $t->text('notes')->nullable();
            $t->json('meta')->nullable();

            $t->timestamps();
            $t->softDeletes();

            // Evitar duplicados exactos activos (MySQL no soporta índices parciales);
            // usamos unicidad “lógica”: no permitimos repetir pareja sin haber terminado.
            $t->unique(['doctor_id', 'patient_id', 'ended_at'], 'doctor_patient_unique_until_end');

            // Búsquedas frecuentes
            $t->index(['patient_id', 'is_primary'], 'dpa_patient_primary_idx');
            $t->index(['doctor_id', 'role'], 'dpa_doctor_role_idx');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('doctor_patient_assignments');
    }
};
