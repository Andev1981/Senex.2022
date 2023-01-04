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
        Schema::create('sesions', function (Blueprint $table) {
            $table->id();
            $table->text('comentario',500)->nullable();
            $table->foreignID('solicitud_id')->constrained()->onUpdate('cascade')->onDelete('cascade');
            $table->dateTime('fecha_session');
            $table->integer('kinesiologo')->nullable();
            $table->tinyInteger('estado')->comment('0: Pendiente de atencion, 1: Atendida, 2: Sin Atencion')->default(0);
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
        Schema::dropIfExists('sesions');
    }
};
