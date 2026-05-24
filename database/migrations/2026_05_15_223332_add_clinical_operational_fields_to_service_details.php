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
            $table->string('billing_code', 50)->nullable()->after('specialty');
            $table->string('agenda_color', 10)->default('#3b82f6')->after('billing_code');
            $table->text('patient_instructions')->nullable()->after('agenda_color');
            $table->boolean('allows_onsite')->default(true)->after('patient_instructions');
            $table->boolean('allows_online')->default(false)->after('allows_onsite');
            $table->boolean('allows_home')->default(false)->after('allows_online');
            $table->integer('max_simultaneous_patients')->default(1)->after('allows_home');
            $table->boolean('requires_consent')->default(false)->after('max_simultaneous_patients');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_details', function (Blueprint $table) {
            $table->dropColumn([
                'billing_code',
                'agenda_color',
                'patient_instructions',
                'allows_onsite',
                'allows_online',
                'allows_home',
                'max_simultaneous_patients',
                'requires_consent'
            ]);
        });
    }
};
