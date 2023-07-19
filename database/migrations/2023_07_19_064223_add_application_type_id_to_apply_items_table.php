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
        Schema::table('apply_items', function (Blueprint $table) {
            $table->foreignID('application_type_id')->onUpdate('cascade')->onDelete('cascade');
            $table->float('price', 9, 0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('apply_items', function (Blueprint $table) {
        
        });
    }
};
