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
        Schema::create('treatment_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre de la sesión, ej: "Kinesiología Respiratoria"
            $table->decimal('base_price', 12, 2)->default(0); // Precio base al paciente
            $table->integer('duration_minutes')->nullable(); // Duración estimada
            $table->boolean('plan_eligible')->default(true); // Si aplica a planes/prepagos
            $table->decimal('plan_session_value', 8, 2)->default(1); // Cuántas sesiones del plan descuenta
            $table->boolean('is_active')->default(true); // Activo/inactivo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('treatment_sessions');
    }
};
