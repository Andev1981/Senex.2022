<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();  // 1..16
            $table->string('code', 4)->unique();
            $table->string('name', 80);
            $table->string('roman', 8)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
