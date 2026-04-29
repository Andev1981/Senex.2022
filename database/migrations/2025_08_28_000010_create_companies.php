<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // company_settings
    // -------------------------
    Schema::create('companies', function (Blueprint $t) {
      $t->id();
      $t->string('rut', 12)->unique();          // normalizado (sin puntos, con guión)
      $t->string('business_name');             // Razón social
      $t->string('giro')->nullable();
      $t->string('email')->nullable();
      $t->string('phone', 30)->nullable();
      $t->string('business_type')->default('clinical');
      $t->json('enabled_modules')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('companies');
  }
};
