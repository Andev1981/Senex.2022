<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->string('url'); // URL pública o firmada
            $table->string('path'); // Ruta física en storage (para borrarla después)

            // Campos polimórficos (imageable_id + imageable_type)
            $table->morphs('imageable');

            $table->string('type')->nullable()->default('profile'); // ej: 'logo', 'profile', 'signature'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
