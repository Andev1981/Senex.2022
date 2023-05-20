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
        Schema::create('payment_expenses', function (Blueprint $table) {
            $table->id();
            $table->float('payment',9,0);
            $table->dateTime('from_range');
            $table->dateTime('to_range');
            $table->string('reference');
            $table->foreignID('user_id')->onUpdate('cascade')->onDelete('cascade');
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
        Schema::dropIfExists('payment_expenses');
    }
};
