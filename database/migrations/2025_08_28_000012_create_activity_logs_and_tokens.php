<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('activity_logs', function (Blueprint $t) {
      $t->id();
      $t->string('action');              // ej: 'payment.paid', 'dte.emitted'
      $t->morphs('subject');            // subject_id, subject_type
      $t->foreignId('causer_id')->nullable()->constrained('users')->nullOnDelete();
      $t->json('properties')->nullable();
      $t->timestamp('logged_at')->useCurrent();
      $t->timestamps();
      $t->index(['action', 'logged_at']);
    });

    // Si no tienes aún (Sanctum)
    if (!Schema::hasTable('personal_access_tokens')) {
      Schema::create('personal_access_tokens', function (Blueprint $table) {
        $table->id();
        $table->morphs('tokenable');
        $table->string('name');
        $table->string('token', 64)->unique();
        $table->text('abilities')->nullable();
        $table->timestamp('last_used_at')->nullable();
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
      });
    }
  }

  public function down(): void
  {
    Schema::dropIfExists('activity_logs');
  }
};
