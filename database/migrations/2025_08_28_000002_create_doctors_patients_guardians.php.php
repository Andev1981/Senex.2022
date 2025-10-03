<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {



        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('last_name');
            $table->string('rut', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'unknown'])->nullable();


            $table->string('occupation')->nullable();
            $table->string('marital_status')->nullable();



            $table->enum('status', ['active', 'suspended', 'cancelled'])->default('active');
            $table->text('status_reason')->nullable();      // motivo del último cambio
            $table->timestamp('status_changed_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices
            $table->unique('rut');                          // único (varios NULL permitidos)
            $table->index(['last_name', 'name']);          // búsqueda por nombre
            $table->index('email');
            $table->index('phone');
        });

        // Users base (ajusta si ya la tienes)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('last_name')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->string('name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('rut', 20)->nullable();
            $table->string('specialty')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['id']);
            $table->index(['branch_id']);
        });

        Schema::create('patient_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('relationship')->nullable(); // o FK a catálogo
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->enum('type', ['emergency', 'guardian', 'other'])->default('emergency');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'type']);
        });

        Schema::create('allergies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable(); // SNOMED/etc
            $table->timestamps();
        });

        Schema::create('patient_allergies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('allergy_id')->constrained()->cascadeOnDelete();
            $table->enum('severity', ['mild', 'moderate', 'severe'])->nullable();
            $table->date('noted_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['patient_id', 'allergy_id']);
        });

        Schema::create('conditions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icd10')->nullable();
            $table->timestamps();
        });

        Schema::create('patient_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('condition_id')->constrained()->cascadeOnDelete();
            $table->date('diagnosed_at')->nullable();
            $table->boolean('active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['patient_id', 'condition_id']);
        });

        Schema::create('insurers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Isapre/Fonasa/Privado
            $table->timestamps();
        });

        Schema::create('insurance_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insurer_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
            $table->unique(['insurer_id', 'name']);
        });

        Schema::create('patient_insurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('member_id')->nullable();
            $table->boolean('is_primary')->default(true);
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('patient_contacts');
        Schema::dropIfExists('allergies');
        Schema::dropIfExists('patient_allergies');
        Schema::dropIfExists('conditions');
        Schema::dropIfExists('patient_conditions');
        Schema::dropIfExists('insurers');
        Schema::dropIfExists('insurance_plans');
        Schema::dropIfExists('patient_insurances');
    }
};
