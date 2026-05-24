<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();  // 1..16
            $table->string('code', 4)->unique();
            $table->string('name', 100)->unique();
            $table->string('roman', 8)->nullable();
            $table->timestamps();
        });

        Schema::create('communes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6)->unique();
            $table->foreignId('region_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->unique(['region_id', 'name']);
            $table->timestamps();
            $table->index('name');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('communes');
        Schema::dropIfExists('regions');
    }
};
