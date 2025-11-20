<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // Ámbito (scope): null = global; o relación polimórfica (Clinic, User, etc.)
            $table->nullableMorphs('scope'); // scope_type + scope_id

            // Clave única dentro del mismo scope (p. ej. "billing.default_payment_term")
            $table->string('key');

            // Valor JSON (flexible: strings, números, objetos)
            $table->json('value')->nullable();

            // Metadatos opcionales (quién lo cambió, notas, etc.)
            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Evita duplicados por scope+key
            $table->unique(['scope_type', 'scope_id', 'key']);
            // Para global (scope null) permite uniqueness sobre key
            $table->unique(['key'])->whereNull('scope_type')->whereNull('scope_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('settings');
    }
};
