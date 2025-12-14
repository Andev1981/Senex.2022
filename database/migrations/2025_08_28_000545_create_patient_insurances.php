<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {

        Schema::create('patient_insurances', function (Blueprint $table) {
            $table->id();
            // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('member_id')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status',['active','inactive','pending'])->default('active');
            $table->boolean('is_primary')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            // Evita que un paciente tenga la misma previsión duplicada en la misma clínica
            $table->unique(['company_id', 'patient_id', 'insurance_id'], 'patient_insurance_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_insurances');
    }
};
