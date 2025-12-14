<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // agenda_slots
    // -------------------------
    Schema::create('agenda_slots', function (Blueprint $table) {
      $table->id();
            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');

      $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
      $table->foreignId('room_id')->constrained()->cascadeOnDelete();
      $table->foreignId('doctor_id')->constrained()->restrictOnDelete();
      $table->date('date');
      $table->time('start_time');
      $table->time('end_time');
      $table->boolean('is_available')->default(true)->index();
      $table->timestamps();
      $table->unique(['room_id', 'date', 'start_time'], 'slot_unique_room_start');
      $table->index(['doctor_id', 'date', 'start_time']);
    });

  }

  public function down(): void
  {
   
    Schema::dropIfExists('agenda_slots');
  }
};
