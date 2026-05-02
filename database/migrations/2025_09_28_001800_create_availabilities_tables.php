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


        Schema::create('availabilities', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();

             // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();

            // Regla iCal RRULE (sin BYHOUR aquí; usa start/end_time para hora)
            $table->string('rrule', 255); // p.ej. FREQ=WEEKLY;BYDAY=MO,TU,TH
            $table->string('modality', 20)->default('onsite');

            // Franja diaria a la que aplica la regla
            $table->time('start_time');   // 09:00:00
            $table->time('end_time');     // 18:00:00

            // 🍴 Soporte para Colación / Breaks Recurrentes
            $table->time('lunch_start_time')->nullable();
            $table->time('lunch_end_time')->nullable();

            // Ventana de validez de la regla
            $table->date('valid_from')->nullable(); // null = desde siempre
            $table->date('valid_until')->nullable(); // null = hasta siempre

            $table->string('timezone', 64)->default('America/Santiago');

            $table->boolean('is_active')->default(true);

            $table->json('meta')->nullable(); // buffer, notas, etc.
            $table->timestamps();

            // Búsquedas típicas
            $table->index(['doctor_id', 'is_active']);
            $table->index(['valid_from', 'valid_until']);

            // Evita duplicados exactos (opcional)
            $table->unique(
                ['doctor_id', 'rrule', 'start_time', 'end_time', 'valid_from', 'valid_until', 'timezone'],
                'availabilities_uniqueness'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('availabilities');
    }
};
