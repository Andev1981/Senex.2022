<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('activity_logs', function (Blueprint $t) {
      $t->engine = 'InnoDB';

      $t->id();
      $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // users.id

      $t->string('action', 100);
      $t->string('entity_type', 100);
      $t->unsignedBigInteger('entity_id');

      $t->json('changes')->nullable();
      $t->string('ip', 45)->nullable(); // IPv4/IPv6
      $t->timestamp('created_at')->useCurrent();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('activity_logs');
  }
};
