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
        Schema::create('apply_items', function (Blueprint $table) {
            $table->id();
            $table->foreignID('user_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('application_id')->onUpdate('cascade')->onDelete('cascade');
            $table->tinyInteger('status')->comment('0:Pendiente de atención,1:Atendido,2:Cancelado,3:Reagendado')->default(0);
            $table->dateTime('fecha_atencion')->nullable();
            $table->text('comments')->nullable();
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
        Schema::dropIfExists('apply_items');
    }
};
