<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {


        Schema::create('patient_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('rut', 20)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->string('relationship')->nullable(); // o FK a catálogo
            $table->enum('type', ['emergency', 'guardian', 'other'])->default('guardian');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'type', 'rut']);
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('patient_contacts');
    }
};
