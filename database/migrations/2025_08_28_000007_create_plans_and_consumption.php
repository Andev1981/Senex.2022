<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    // -------------------------
    // plans
    // -------------------------
    Schema::create('plans', function (Blueprint $t) {

      $t->id();


      $t->string('name');
      $t->enum('type', ['annual', 'session_pack', 'unlimited']);
      $t->integer('total_sessions')->nullable();
      $t->decimal('price', 12, 2);
      $t->integer('valid_months')->nullable();
      $t->json('session_types')->nullable(); // IDs permitidos
      $t->boolean('is_active')->default(true);
      $t->timestamps();
    });

    // -------------------------
    // patient_plans
    // -------------------------
    Schema::create('patient_plans', function (Blueprint $t) {

      $t->id();


      $t->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
      $t->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
      $t->foreignId('payment_id')->nullable()
        ->constrained('payments')->nullOnDelete();

      $t->dateTime('purchased_at');
      $t->date('expiry_date')->nullable();
      $t->integer('sessions_included')->nullable();
      $t->integer('sessions_used')->default(0);
      $t->enum('status', ['active', 'expired', 'exhausted', 'paused'])->default('active');
      $t->timestamps();
    });

    // -------------------------
    // plan_session_consumptions
    // -------------------------
    Schema::create('plan_session_consumptions', function (Blueprint $t) {

      $t->id();

      $t->foreignId('patient_plan_id')->constrained('patient_plans')->cascadeOnDelete();
      $t->foreignId('treatment_session_id')->constrained('treatment_sessions')->cascadeOnDelete();

      $t->integer('sessions_consumed')->default(1);
      $t->dateTime('consumed_at');
      $t->timestamps();
    });
  }

  public function down(): void
  {


    Schema::dropIfExists('plan_session_consumptions');
    Schema::dropIfExists('patient_plans');
    Schema::dropIfExists('plans');
  }
};
