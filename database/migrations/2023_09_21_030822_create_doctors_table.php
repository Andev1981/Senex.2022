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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->string('name',50);
            $table->string('last_name',50);
            $table->string('avatar',255)->nullable();
            $table->string('rut',10)->nullable();
            $table->date('birth')->nullable();
            $table->string('phone')->nullable();
            $table->foreignID('address_id')->constrained()->onUpdate('cascade')->onDelete('cascade')->default(1);
            $table->tinyInteger('status')->comment('0:Inactivo,1:Activo')->default(1);
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
        Schema::dropIfExists('doctors');
    }
};
