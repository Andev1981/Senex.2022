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
            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
            $table->string('name'); // Nombre del plan (ej: Plan 3, Plan Bronce)
            $table->string('code')->unique();

            // Plan type and sessions
            $table->foreignId('insurance_id')->constrained()->onDelete('cascade');
            $table->decimal('coverage_percentage', 5, 2); // Porcentaje cubierto por el plan (ej: 70.00)
            $table->enum('type', ['annual', 'session_pack', 'unlimited']);
            $table->integer('total_sessions')->nullable();
            $table->integer('price');
            $table->integer('valid_months')->nullable();
             
            // Validity period
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Additional details
            $table->text('description')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('is_active');
            $table->index('type');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('plans');
  }
};
