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
        Schema::create('notification_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('notification_id')->nullable();
            // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();

            // Ejemplos de tipo: 'invoice.created', 'attendance.reminder', 'payment.failed'
            $table->string('event_key');

            // Canal: 'in_app', 'email', 'sms', 'whatsapp', etc.
            $table->string('channel', 32);

            $table->string('status')->nullable();

            $table->string('error_message')->nullable();

            // Reglas/horarios silenciosos u opciones específicas (JSON)
            $table->timestamp('sent_at')->nullable();

            $table->timestamps();


            $table->index(['patient_id', 'event_key']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('notification_attempts');
    }
};
