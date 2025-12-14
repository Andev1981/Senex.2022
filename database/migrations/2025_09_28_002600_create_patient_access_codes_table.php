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
        Schema::create('patient_access_codes', function (Blueprint $table) {
            $table->id();
            
             // 🎯 Seguridad Multiempresa
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            // Relación con paciente
            $table->foreignId('patient_id')
                ->constrained('patients')
                ->cascadeOnDelete();
            
            // Código de 6 dígitos
            $table->string('code', 6)->index();
            
            // Control de expiración y uso
            $table->timestamp('expires_at')->index();
            $table->timestamp('used_at')->nullable();
            
            // IP y user agent para seguridad
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            // Timestamps
            $table->timestamp('created_at')->useCurrent();
            
            // Índices compuestos para consultas frecuentes
            $table->index(['patient_id', 'code', 'expires_at']);
            $table->index(['code', 'used_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_access_codes');
    }
};