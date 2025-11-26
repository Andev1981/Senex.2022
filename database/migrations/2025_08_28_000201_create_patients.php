<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {



        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')
                      ->nullable()
                      ->constrained('branches')
                      ->nullOnDelete();
            $table->string('name');
            $table->string('last_name');
            $table->string('rut', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'unknown'])->nullable();


            $table->string('occupation')->nullable();
            $table->string('marital_status')->nullable();



            $table->enum('status', ['active', 'inactive', 'deceased','transferred','archived'])->default('active');
            $table->text('status_reason')->nullable();      // motivo del último cambio
            $table->timestamp('status_changed_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices
            $table->unique('rut');                          // único (varios NULL permitidos)
            $table->index(['last_name', 'name']);          // búsqueda por nombre
            $table->index('email');
            $table->index('phone');
            $table->index('branch_id');
        });

      
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
