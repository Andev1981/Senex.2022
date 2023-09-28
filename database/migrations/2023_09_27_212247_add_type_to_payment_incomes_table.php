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
        Schema::table('payment_incomes', function (Blueprint $table) {
              $table->tinyInteger('type')->comment('0:Sesión,1:Abono,2:Saldo')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('payment_incomes', function (Blueprint $table) {
            //
        });
    }
};
