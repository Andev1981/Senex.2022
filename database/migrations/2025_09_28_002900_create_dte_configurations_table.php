<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dte_configurations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')->constrained()->after('id')->comment('Foreign key to the owner company.');

            // Technical Fields in English
            $table->string('company_rut', 12)->comment('Company RUT (tax ID) for DTE operations.'); 
            $table->string('signer_rut', 12)->nullable()->comment('Signer RUT (Person) extracted from certificate.');
            $table->string('certificate_path')->nullable()->comment('Physical path to the .pfx certificate file.');
            $table->text('certificate_password')->nullable()->comment('Encrypted PFX password.');
            $table->enum('environment', ['certification', 'production'])->default('certification');
            $table->boolean('simulation_mode')->default(true)->comment('If true, bypasses SII and certificate requirements.');
            $table->timestamp('expiration_date')->nullable()->comment('PFX certificate expiration date.');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dte_configurations');
    }
};
