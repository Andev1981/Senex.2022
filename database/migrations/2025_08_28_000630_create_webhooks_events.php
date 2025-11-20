<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // webhook_events
    // -------------------------
    Schema::create('webhook_events', function (Blueprint $t) {
      $t->id();
      
      $t->string('provider', 50)->index()->comment('webpay, flow, mercadopago, etc');
      $t->string('event_type', 100)->index()->comment('payment.approved, payment.failed, etc');
      $t->string('idempotency_key', 100)->unique()->comment('Para evitar procesamiento duplicado');
      
      $t->json('payload')->comment('Datos completos del webhook');
      $t->timestamp('processed_at')->useCurrent();
      
      $t->timestamps();

      $t->index(['provider', 'event_type', 'processed_at'], 'webhooks_provider_event_idx');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('webhook_events');
  }
};
