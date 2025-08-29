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
        Schema::create('session_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // "Kinesiología Respiratoria"
            $table->decimal('base_price', 12, 2)->default(0); // Precio base
            $table->integer('duration_minutes')->nullable();  // Duración estimada
            $table->boolean('plan_eligible')->default(true);  // Apto para planes
            $table->unsignedInteger('plan_session_value')->default(1); // Cuántas sesiones descuenta
            $table->boolean('is_active')->default(true);      // activar/desactivar sin borrar
            $table->timestamps();
            $table->index(['is_active', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('session_types');
    }
};
