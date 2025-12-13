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
        Schema::create('billing_liquidations', function (Blueprint $table) {
            $table->id();
            // Referencias a la prestación y contexto:
            $table->foreignId('treatment_session_id')->constrained()->onDelete('cascade'); // La sesión que generó el cobro
            $table->foreignId('treatment_id')->constrained()->onDelete('cascade'); // El tratamiento al que pertenece
            $table->foreignId('plan_id')->nullable()->constrained('plans'); // Plan usado

            // Montos:
            $table->decimal('gross_amount', 10, 2); // Monto total de la sesión (sin descuento)
            $table->decimal('primary_covered_amount', 10, 2)->default(0); // Monto cubierto por el 1er seguro
            $table->decimal('patient_copayment_amount', 10, 2); // Monto que debe pagar el paciente (puede ser 0)

            // Estado:
            $table->enum('status', ['pending', 'partial_paid', 'fully_paid', 'cancelled'])->default('pending');
            
            // Referencia al DTE (si aplica):
            $table->string('dte_folio')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_liquidations');
    }
};
