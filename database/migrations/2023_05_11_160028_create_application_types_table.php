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
        Schema::create('application_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignID('solicitud_type_id')->onUpdate('cascade')->onDelete('cascade');
            $table->tinyInteger('status')->comment('0:Pendiente,1:En Proceso,2:Finalizada')->default(0);
            $table->tinyInteger('payment_id')->comment('0:Pendiente,1:Atendida')->default(0);
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
        Schema::dropIfExists('application_types');
    }
};
