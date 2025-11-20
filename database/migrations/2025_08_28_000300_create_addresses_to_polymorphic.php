<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {

        Schema::create('addresses', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();


            // relación polimórfica
            $table->morphs('addressable');

            // metadatos
            $table->string('type', 32)->default('other');
            $table->boolean('is_primary')->default(false);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();

            // campos típicos de dirección (ajusta a los que tengas en tu proyecto)
            $table->string('street')->nullable();
            $table->string('number')->nullable();

            $table->foreignId('commune_id')->nullable()->constrained('communes')->nullOnDelete();
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();
            $table->string('details')->nullable();
            $table->string('country')->nullable();

            $table->timestamps();
        });

        return; // nada más que hacer

    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
