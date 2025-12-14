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
        Schema::create('liquidation_payors', function (Blueprint $table) {
            $table->id();
             $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
      $table->foreignId('branch_id')
          ->nullable() // Puede ser null si es una operación central.
          ->constrained()
          ->comment('Sucursal donde se emitió el DTE.');
            $table->foreignId('billing_liquidation_id')->constrained()->onDelete('cascade');
            
            // Identificador de la entidad pagadora:
            $table->foreignId('insurance_id')->nullable()->constrained(); // Si es un seguro
            $table->foreignId('patient_id')->nullable()->constrained(); // Si es el paciente (su copago)

            $table->enum('payor_role', ['primary_insurance', 'secondary_insurance', 'patient_copay'])->index();
            $table->decimal('amount_due', 10, 2); // Monto específico que esta entidad debe pagar
            $table->boolean('is_paid')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('liquidation_payors');
    }
};
