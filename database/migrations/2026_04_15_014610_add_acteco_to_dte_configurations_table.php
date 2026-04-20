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
            $table->integer('acteco')->nullable()->after('company_rut')->comment('Código de Actividad Económica principal ante el SII');
        });
    }

    public function down(): void
    {
        Schema::table('dte_configurations', function (Blueprint $table) {
            $table->dropColumn('acteco');
        });
    }
};
