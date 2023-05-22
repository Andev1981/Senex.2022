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
            $table->string('name',50);
            $table->string('last_name',100)->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('parentesco')->nullable();
            $table->foreignID('user_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('address_id')->onUpdate('cascade')->onDelete('cascade');
            
            /* $table->tinyInteger('relationship')->nullable()->comment('0:Madre,1:Padre,2:Hijo, 3:Hija, 4:SObrino, 5: Sobrina, 6:Nieto,7:Nieta, 8:Hermano, 9:Hermana'); */
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
