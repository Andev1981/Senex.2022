<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // availabilities
    // -------------------------
    Schema::create('availabilities', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete(); // doctors.id

      $t->string('timezone', 64)->default('America/Santiago');
      $t->text('rrule')->nullable();      // FREQ=WEEKLY;BYDAY=MO,WE...
      $t->time('start_time')->nullable();
      $t->time('end_time')->nullable();
      $t->date('valid_from')->nullable();
      $t->date('valid_until')->nullable();
      $t->boolean('is_active')->default(true);
      $t->json('meta')->nullable();
      $t->timestamps();
    });

    // -------------------------
    // appointments
    // -------------------------
    Schema::create('appointments', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete(); // patients.id
      $t->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();   // doctors.id
      $t->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete(); // rooms.id (nullable)

      $t->dateTime('start_at');
      $t->dateTime('end_at');
      $t->enum('status', [
        'scheduled',
        'checked_in',
        'in_progress',
        'completed',
        'no_show',
        'cancelled'
      ])->default('scheduled');
      $t->dateTime('check_in_at')->nullable();
      $t->dateTime('started_at')->nullable();
      $t->dateTime('completed_at')->nullable();
      $t->text('notes')->nullable();
      $t->json('meta')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('appointments');
    Schema::dropIfExists('availabilities');
  }
};
