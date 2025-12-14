<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    Schema::create('patient_lifestyles', function (Blueprint $table) {
      $table->id();
       // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
      $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'vigorous'])->nullable();
      $table->string('sport')->nullable();
      $table->text('notes')->nullable();
      $table->date('from_date')->nullable();
      $table->date('to_date')->nullable();
      $table->enum('dominant_side', ['Right', 'Left', 'Ambidextrous'])->default('Right');
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('patient_lifestyles');
  }
};
