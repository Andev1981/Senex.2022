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

            // rango afectado (fecha/hora si quieres granularidad fina)
            $table->date('date')->nullable(); // opción simple: un día
            $table->dateTime('start_at')->nullable();
            $table->dateTime('end_at')->nullable();

            // tipo: 'cancel', 'override' (podrías agregar una franja alternativa)
            $table->enum('action', ['cancel', 'override'])->default('cancel');

            // si 'override', puedes opcionalmente definir nueva franja
            $table->time('override_start_time')->nullable();
            $table->time('override_end_time')->nullable();

            $table->string('reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['doctor_id', 'date']);
            $table->index(['start_at', 'end_at']);
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
