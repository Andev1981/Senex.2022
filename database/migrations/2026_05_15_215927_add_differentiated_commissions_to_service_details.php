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
        Schema::table('service_details', function (Blueprint $table) {
            $table->string('commission_type')->default('fixed_amount')->after('default_doctor_commission_clp');
            $table->integer('default_doctor_commission_own_clp')->nullable()->after('commission_type');
            $table->integer('default_doctor_commission_assigned_clp')->nullable()->after('default_doctor_commission_own_clp');
            $table->decimal('default_doctor_commission_percentage', 5, 2)->nullable()->after('default_doctor_commission_assigned_clp');
            $table->decimal('default_doctor_commission_own_percentage', 5, 2)->nullable()->after('default_doctor_commission_percentage');
            $table->decimal('default_doctor_commission_assigned_percentage', 5, 2)->nullable()->after('default_doctor_commission_own_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_details', function (Blueprint $table) {
            $table->dropColumn([
                'commission_type',
                'default_doctor_commission_own_clp',
                'default_doctor_commission_assigned_clp',
                'default_doctor_commission_percentage',
                'default_doctor_commission_own_percentage',
                'default_doctor_commission_assigned_percentage'
            ]);
        });
    }
};
