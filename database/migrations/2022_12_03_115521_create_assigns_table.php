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
        Schema::create('assigns', function (Blueprint $table) {
            $table->id();
            $table->foreignID('user_id')->constrained()->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('patient_id')->constrained()->onUpdate('cascade')->onDelete('cascade');
            $table->tinyInteger('relation')->comment('0:Madre,1:Padre,2:Hijo, 3:Hija, 4:SObrino, 5: Sobrina, 6:Nieto,7:Nieta, 8:Hermano, 9:Hermana')->default(0);
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
        Schema::dropIfExists('assigns');
    }
};
