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
        Schema::table('application_type_users', function (Blueprint $table) {
             $table->foreignID('doctor_id')->onUpdate('cascade')->onDelete('is null')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('application_type_users', function (Blueprint $table) {
            //
        });
    }
};
