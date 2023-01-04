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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->text('message',500)->nullable();
            $table->foreignID('solicitud_id')->constrained()->onUpdate('cascade')->onDelete('cascade');
            $table->tinyInteger('range')->comment('0: 3 Meses, 1: 6 Meses, 2: 12 Meses, 3: Sin Limite')->nullable();
            $table->tinyInteger('state')->comment('0: Inactiva,1: Activa')->default(1);
            $table->integer('sends');
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
        Schema::dropIfExists('prescriptions');
    }
};
