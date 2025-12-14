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


        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
             // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            // Polimórfica si mapeas varios modelos (citas, bloqueos)
            $table->morphs('eventable'); // eventable_type, eventable_id
            $table->foreignId('calendar_account_id')->constrained()->cascadeOnDelete();
            $table->string('external_event_id');
            $table->string('external_etag')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['calendar_account_id', 'external_event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('calendar_events');
    }
};
