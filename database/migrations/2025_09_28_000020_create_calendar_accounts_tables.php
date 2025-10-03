<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {


        Schema::create('calendar_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->enum('provider', ['google', 'microsoft']);
            $table->string('external_calendar_id');
            $table->json('auth_tokens'); // access_token, refresh_token, expiry
            $table->timestamps();

            $table->unique(['doctor_id', 'provider'], 'doctor_provider_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('calendar_accounts');
    }
};
