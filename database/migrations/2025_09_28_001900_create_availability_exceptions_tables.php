<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {


        Schema::create('availability_exceptions', function (Blueprint $table) {
            $table->id();

             // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');

            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();

            $table->date('date'); // Fecha inicio
            $table->date('end_date')->nullable(); // Fecha fin (para rangos/vacaciones)
            
            // tipo: 'cancel', 'override', 'open'
            $table->enum('action', ['cancel', 'override', 'open'])->default('cancel');

            // para bloqueos parciales (horas), overrides de horario o aperturas especiales
            $table->time('override_start_time')->nullable();
            $table->time('override_end_time')->nullable();

            // Opcionales para 'open' (Permite libertad de boxes si es null)
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->string('modality', 20)->nullable(); 

            $table->string('reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['doctor_id', 'date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('availability_exceptions');
    }
};
