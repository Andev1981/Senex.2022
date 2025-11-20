<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // session_types (PADRE)
    // -------------------------
    Schema::create('session_types', function (Blueprint $table) {
      $table->id(); // BIGINT UNSIGNED AI
      $table->string('name', 120)->unique();
      $table->decimal('base_price', 12, 2)->default(0);
      $table->unsignedSmallInteger('duration_minutes')->default(45);
      $table->boolean('plan_eligible')->default(true);
      $table->unsignedInteger('plan_session_value')->default(1);
      $table->boolean('active')->default(true)->index();
      $table->timestamps();
      $table->softDeletes();
    });

  }

  public function down(): void
  {

    Schema::dropIfExists('session_types');
  }
};
