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
        Schema::create('payment_incomes', function (Blueprint $table) {
            $table->id();
            $table->float('pay',9,0);
            $table->foreignID('application_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('apply_item_id')->onUpdate('cascade')->onDelete('cascade');
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
        Schema::dropIfExists('payment_incomes');
    }
};
