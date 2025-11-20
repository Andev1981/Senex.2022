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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Ejemplos de tipo: 'invoice.created', 'attendance.reminder', 'payment.failed'
            $table->string('event_key');

            // Canal: 'in_app', 'email', 'sms', 'whatsapp', etc.
            $table->string('channel', 32);

            // enabled = true/false
            $table->boolean('enabled')->default(true);

            // Reglas/horarios silenciosos u opciones específicas (JSON)
            $table->json('options')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'event_key', 'channel']);
            $table->index(['user_id', 'event_key']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('notification_preferences');
    }
};
