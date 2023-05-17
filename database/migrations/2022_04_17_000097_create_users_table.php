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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name',50);
            $table->string('last_name',50);
            $table->string('email')->unique();
            $table->string('password');
            $table->string('avatar',255)->nullable();
            $table->string('rut',10)->nullable();
            $table->date('birth')->nullable();
            $table->string('phone')->nullable();
            $table->foreignID('address_id')->constrained()->onUpdate('cascade')->onDelete('cascade')->default(1);
            $table->timestamp('email_verified_at')->nullable();
            $table->tinyInteger('status')->comment('0:Inactivo,1:Activo')->default(1);
            $table->string('user_type')->comment('0: SuperAdmin. 1: Admin. 2: Doctor. 4: Paciente')->default(4);
            $table->softDeletes();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
};
