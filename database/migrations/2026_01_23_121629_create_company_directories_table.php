<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies_directory', function (Blueprint $table) {
            $table->id();
            $table->string('rut')->unique()->index();
            $table->string('business_name');
            $table->string('activity')->nullable();
            $table->timestamp('last_api_sync_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies_directory');
    }
};
