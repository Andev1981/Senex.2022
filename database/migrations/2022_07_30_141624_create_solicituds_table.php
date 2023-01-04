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
        Schema::create('solicituds', function (Blueprint $table) {
            $table->id();
            $table->foreignID('solicitud_type_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('doctor_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('patient_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('quizz_id')->onUpdate('cascade')->onDelete('cascade');
            $table->dateTime('attention_date')->nullable();
            $table->tinyInteger('status')->comment('0:Pendiente,1:Atendida')->default(0);
            $table->text('comments')->nullable();
            $table->foreignID('payment_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('schedule_id')->onUpdate('cascade')->onDelete('cascade');
            $table->integer('sessions_count')->default(0);
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
        Schema::dropIfExists('solicituds');
    }
};
