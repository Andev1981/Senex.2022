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
            $table->foreignID('user_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('application_type_id')->onUpdate('cascade')->onDelete('cascade');
            $table->float('price',9,0);
            $table->tinyInteger('status')->comment('0:Pendiente,1:En Proceso,2:Finalizada')->default(0);
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
