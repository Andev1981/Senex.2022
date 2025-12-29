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
        Schema::table('dte_configurations', function (Blueprint $table) {
            $table->boolean('simulation_mode')->default(true)->after('ambiente')->comment('Si es true, no envía datos al SII y permite operar sin certificado real.');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dte_configurations', function (Blueprint $table) {
            $table->dropColumn('simulation_mode');
        });
    }
};