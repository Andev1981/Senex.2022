<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    // =========================
    // medical_attachments
    // =========================
    Schema::create('medical_attachments', function (Blueprint $t) {
      $t->id();

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('clinical_note_id')->nullable()
        ->constrained('clinical_notes')->nullOnDelete();
      $t->foreignId('treatment_session_id')->nullable()
        ->constrained('treatment_sessions')->nullOnDelete();

      $t->string('title')->nullable();
      $t->string('mime_type', 100)->nullable();
      $t->unsignedBigInteger('size_bytes')->nullable();
      $t->string('storage_path');
      $t->json('tags')->nullable();
      $t->json('meta')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('medical_attachments');
  }
};
