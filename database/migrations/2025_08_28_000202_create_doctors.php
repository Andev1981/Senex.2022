<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {


        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')
                      ->nullable()
                      ->constrained('branches')
                      ->nullOnDelete();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('last_name');
            $table->string('rut', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('speciality')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'unknown'])->nullable();
            $table->enum('status', ['active', 'suspended', 'cancelled'])->default('active');
            $table->boolean('mobile_app_access')->default(true);
            $table->text('status_reason')->nullable();      // motivo del último cambio
            $table->timestamp('status_changed_at')->nullable();
            $table->timestamps();

            $table->index(['id']);
        });

       
    }

    public function down(): void
    {

        Schema::dropIfExists('doctors');

    }
};
