<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->unsignedSmallInteger('region_id');
            $table->string('code', 6)->unique();
            $table->string('name', 80);
            $table->timestamps();

            $table->foreign('region_id')->references('id')->on('regions')->cascadeOnDelete();
            $table->index(['region_id', 'name']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('provinces');
    }
};
