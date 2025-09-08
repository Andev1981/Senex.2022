<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('branches', function (Blueprint $t) {
      $t->id();

      $t->string('name');
      $t->string('code', 50);
      $t->string('timezone', 64)->default('America/Santiago');
      $t->timestamps();
      $t->unique(['code']);
      $t->index(['id']); // soporte a FKs compuestas
    });

    Schema::create('rooms', function (Blueprint $t) {
      $t->id();

      $t->unsignedBigInteger('branch_id');
      $t->string('name');
      $t->enum('status', ['available', 'occupied', 'cleaning', 'maintenance'])->default('available');
      $t->timestamps();

      $t->index(['id']);
      $t->index(['branch_id']);
      $t->foreign(['branch_id'])
        ->references(['id'])->on('branches')
        ->cascadeOnDelete();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('rooms');
    Schema::dropIfExists('branches');
  }
};
