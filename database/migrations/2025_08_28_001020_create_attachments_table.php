<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // =========================
    // attachments (Renombrado de medical_attachments)
    // =========================
    Schema::create('attachments', function (Blueprint $t) {
      $t->id();

      // 🎯 Seguridad Multiempresa
      $t->foreignId('company_id')->constrained()->onDelete('cascade');

      // FKs SIMPLES
      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      
      // Relación con el Tratamiento (Consolidado)
      $t->foreignId('treatment_id')->nullable()->constrained()->nullOnDelete();
      
      // Relación opcional con una sesión específica
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
    Schema::dropIfExists('attachments');
  }
};
