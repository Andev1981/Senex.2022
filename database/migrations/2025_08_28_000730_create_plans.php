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
    Schema::create('plans', function (Blueprint $table) {

            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            
            // Polymorphic relationship with health_insurers or insurance_companies
            $table->enum('institution_type', ['health_insurer', 'insurance_company','clinic'])->default('clinic');
            $table->unsignedBigInteger('institution_id')->nullable();
            
            // Plan type and sessions
            $table->enum('type', ['annual', 'session_pack', 'unlimited']);
            $table->integer('total_sessions')->nullable();
            $table->integer('price');
            $table->integer('valid_months')->nullable();
            $table->text('session_types')->nullable()->comment('Allowed session type IDs');
            
            // Additional details
            $table->text('description')->nullable();
            $table->text('coverage')->nullable()->comment('Coverage details');
            
            // Validity period
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['institution_type', 'institution_id']);
            $table->index('is_active');
            $table->index('type');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('plans');
  }
};
