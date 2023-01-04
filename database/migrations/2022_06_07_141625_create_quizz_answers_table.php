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
        Schema::create('quizz_answers', function (Blueprint $table) {
            $table->id();
            $table->string('answer');
            $table->foreignID('solicitud_id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignID('quizz_question_id')->onUpdate('cascade')->onDelete('cascade');
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
        Schema::dropIfExists('quizz_answers');
    }
};
