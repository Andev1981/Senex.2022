<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {


        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
            $table->string('name');
            $table->string('last_name');
            $table->string('rut', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('license_number', 50)->nullable();
            /* $table->foreignId('specialty_id')
          ->nullable() // Puede ser null si es una operación central.
          ->constrained()
          ->comment('Sucursal donde se emitió el DTE.'); */
            $table->string('speciality')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'unknown'])->nullable();
            
            $table->timestamps();

            $table->index(['id']);

             // Índices
            $table->unique('rut');                          // único (varios NULL permitidos)
            $table->index(['last_name', 'name']);          // búsqueda por nombre
            $table->index('email');
            $table->index('phone');

        });

       
    }

    public function down(): void
    {

        Schema::dropIfExists('doctors');

    }
};
