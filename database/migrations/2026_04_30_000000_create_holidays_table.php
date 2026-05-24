<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->date('end_date')->nullable(); // Rangos de vacaciones
            $table->time('start_time')->nullable(); // Cierre parcial
            $table->time('end_time')->nullable();   // Cierre parcial
            $table->string('name');
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();

            // Quitamos el único de fecha para permitir múltiples bloqueos parciales o rangos
            $table->index(['company_id', 'branch_id', 'date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
