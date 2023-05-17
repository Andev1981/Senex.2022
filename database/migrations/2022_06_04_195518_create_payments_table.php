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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->float('pay',9,2);
            $table->tinyInteger('status')->comment('0: Procesando. 1: Pendiente. 2: Aprobada. 3: Cancelada/Fallida')->default(1);
            $table->tinyInteger('type')->comment('0: Mensual. 1: Cheque. 2: Efectivo. 3: Por Atencion,4:Tratamiento,5:Transferencia')->default(1);
            $table->integer('paymenttable_id');
            $table->string('paymenttable_type');
            $table->softDeletes();
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
        Schema::dropIfExists('payments');
    }
};
