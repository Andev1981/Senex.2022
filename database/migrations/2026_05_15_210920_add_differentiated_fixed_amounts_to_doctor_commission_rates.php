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
        Schema::table('doctor_commission_rates', function (Blueprint $blueprint) {
            $blueprint->integer('amount_clp_own')->nullable()->after('amount_clp');
            $blueprint->integer('amount_clp_assigned')->nullable()->after('amount_clp_own');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_commission_rates', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['amount_clp_own', 'amount_clp_assigned']);
        });
    }
};
