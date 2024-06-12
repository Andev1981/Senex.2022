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
            $table->tinyInteger('estado_pago')->default(0)->comment('0:Pendiente,1:Pagado')->nullable();
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
            //
        });
    }
};
