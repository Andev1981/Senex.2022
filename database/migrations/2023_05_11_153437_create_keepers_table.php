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
        Schema::create('keepers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->foreignID('user_id')->onUpdate('cascade')->onDelete('cascade');
            $table->tinyInteger('relationship')->comment('0:Madre,1:Padre,2:Hijo, 3:Hija, 4:SObrino, 5: Sobrina, 6:Nieto,7:Nieta, 8:Hermano, 9:Hermana')->default(0);
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
        Schema::dropIfExists('keepers');
    }
};
