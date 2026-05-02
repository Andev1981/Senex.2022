<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    Schema::create('rooms', function (Blueprint $table) {
      $table->id();
      $table->foreignId('company_id')->constrained()->cascadeOnDelete();
      $table->foreignId('branch_id')
          ->nullable() 
          ->constrained()
          ->nullOnDelete();
      $table->string('name', 80);
      $table->unsignedTinyInteger('capacity')->default(1);
      $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
      $table->timestamps();
      $table->unique(['branch_id', 'name']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('rooms');
  }
};
