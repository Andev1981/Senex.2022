<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('doctors', function (Blueprint $t) {
      $t->id();

      $t->foreignId('user_id')->constrained()->onDelete('cascade');
      $t->unsignedBigInteger('branch_id')->nullable();
      $t->string('name')->nullable();
      $t->string('last_name')->nullable();
      $t->string('rut', 20)->nullable();
      $t->string('specialty')->nullable();
      $t->boolean('is_active')->default(true);
      $t->timestamps();

      $t->index(['id']);
      $t->index(['branch_id']);
    });

    Schema::create('patients', function (Blueprint $t) {
      $t->id();

      $t->string('name');
      $t->string('last_name');
      $t->string('rut', 20)->nullable();
      $t->string('email')->nullable();
      $t->string('phone', 50)->nullable();
      $t->date('birth_date')->nullable();
      $t->enum('gender', ['male', 'female', 'other', 'unknown'])->nullable();
      $t->enum('status', ['active', 'suspended', 'cancelled'])->default('active');
      $t->text('notes')->nullable();
      $t->timestamps();

      $t->index(['id']);
      $t->index('rut');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('patients');
    Schema::dropIfExists('doctors');
  }
};
