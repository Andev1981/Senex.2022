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
        Schema::create('branch_session_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('session_type_id')->constrained()->cascadeOnDelete();

            // --- CAMPOS DE SOBREESCRITURA (OVERRIDES) ---
            // Si están en NULL, el sistema usará el valor de session_types.

            // 1. Precio Local: Quizás en Vitacura es más caro que en Maipú.
            $table->unsignedInteger('custom_price_clp')->nullable();

            // 2. Duración Local: Quizás en una sucursal tienen box más pequeños y atienden cada 30 min.
            $table->unsignedInteger('custom_duration_minutes')->nullable();

            $table->unsignedInteger('custom_doctor_commission_clp')->nullable();

            // 3. Disponibilidad Local: 
            // Fundamental. Quizás la sucursal A no tiene gimnasio, por lo tanto
            // no puede ofrecer "Kinesiología Deportiva", aunque la empresa sí la tenga.
            $table->boolean('is_active_in_branch')->default(true);

            // 4. (Opcional) Código Fonasa/Isapre Local
            // A veces el código de prestación cambia según la resolución sanitaria de la sucursal.
            // Solo agrégalo si tus clientes facturan con RUTs distintos por sucursal.
            $table->string('custom_code')->nullable();

            $table->timestamps();

            // Evita duplicados: Una sesión solo puede estar configurada una vez por sucursal
            $table->unique(['branch_id', 'session_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_session_types');
    }
};
