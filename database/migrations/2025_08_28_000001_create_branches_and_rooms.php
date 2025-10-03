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

    Schema::create('rooms', function (Blueprint $table) {
      $table->id();

      $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
      $table->string('name', 80);
      $table->unsignedTinyInteger('capacity')->default(1);
      $table->enum('status', ['available', 'occupied', 'cleaning', 'maintenance'])->default('available');
      $table->timestamps();
      $table->unique(['branch_id', 'name']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('rooms');
    Schema::dropIfExists('branches');
  }
};
