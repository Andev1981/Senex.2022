<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('branches', function (Blueprint $table) {
      $table->id();

      $table->string('name', 120);
      $table->string('rut', 12)->nullable();
      $table->string('phone', 30)->nullable();
      $table->string('email')->nullable();
      $table->boolean('active')->default(true)->index();
      $table->timestamps();
      $table->index(['id']); // soporte a FKs compuestas
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('rooms');
  }
};
