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

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('treatment_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();

            $table->dateTime('attended_at')->nullable();
            $table->boolean('attended')->default(false);

            // Valores relacionados a comisiones (en centavos si aplica)
            $table->unsignedInteger('patient_amount_cl')->default(0);
            $table->unsignedInteger('doctor_amount_cl')->default(0);
            $table->unsignedInteger('clinic_amount_cl')->default(0);

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'doctor_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        Schema::dropIfExists('attendances');
    }
};
