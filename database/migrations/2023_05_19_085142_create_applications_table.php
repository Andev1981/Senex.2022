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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('derivado')->nullable();
            $table->string('desde')->nullable();
            $table->text('comments')->nullable();
            $table->foreignID('user_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('applications_type_id')->onUpdate('cascade')->onDelete('cascade');
            $table->float('price', 9, 0);
            $table->tinyInteger('status')->comment('0:Pendiente,1:En Proceso,2:Finalizada')->default(0);

            $table->tinyInteger('type_value')->comment('1:Por Sesión,1:Tratamiento completo')->default(0);

            $table->tinyInteger('type_payment')->comment('1:Por Sesión,1:Por Tratamiento,2:Mensual por sesiones')->default(0);

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
        Schema::dropIfExists('applications');
    }
};
