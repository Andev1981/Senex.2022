<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla principal de bonos/vouchers
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
            $table->foreignId('insurance_id')
                ->nullable() // Opcional: El bono puede no ser de Isapre (ej: bono regalo)
                ->constrained()
                ->nullOnDelete();
            $table->foreignId('plan_id')
                ->nullable() // 🎯 AQUÍ: Permite bonos sin plan asociado
                ->constrained()
                ->nullOnDelete();
            $table->foreignId('branch_id')
                ->nullable() // Puede ser null si es una operación central.
                ->constrained();

            // Código único del bono (ej: IMED-2025-001234)
            $table->string('code', 50)->unique()->index();
            
            // Relación con paciente (nullable para bonos genéricos)
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            
            // Tipo de bono
            $table->enum('type', [
                'monetary',        // Bono monetario (ej: vale por $50.000)
                'sessions',        // Bono de sesiones (ej: 10 sesiones prepagadas)
                'treatment',       // Bono por tratamiento completo
                'percentage'       // Bono de descuento porcentual
            ])->default('monetary');
            
            // Valores según tipo
            $table->unsignedBigInteger('monetary_value')->default(0); // Valor en CLP
            $table->unsignedInteger('sessions_quantity')->default(0); // Cantidad de sesiones
            $table->unsignedInteger('sessions_remaining')->default(0); // Sesiones restantes
            $table->decimal('discount_percentage', 5, 2)->default(0); // Porcentaje de descuento
            
            // Saldos (en CLP)
            $table->unsignedBigInteger('initial_balance')->default(0);
            $table->unsignedBigInteger('current_balance')->default(0);
            $table->unsignedBigInteger('used_balance')->default(0);
            
            // Estado del bono
            $table->enum('status', [
                'active',
                'partially_used',
                'fully_used',
                'expired',
                'cancelled',
                'pending_activation'
            ])->default('pending_activation')->index();
            
            // Fechas importantes
            $table->date('issued_date')->index();
            $table->date('activation_date')->nullable();
            $table->date('expiration_date')->nullable()->index();
            $table->dateTime('last_used_at')->nullable();
            
            // Restricciones de uso
            $table->json('allowed_treatments')->nullable(); // IDs de tratamientos permitidos
            $table->json('allowed_session_types')->nullable(); // IDs de tipos de sesión permitidos
            $table->boolean('is_transferable')->default(false); // ¿Se puede transferir a otro paciente?
            
            // Información de origen (IMED, compra interna, etc.)
            $table->enum('source', [
                'imed',           // Bono adquirido vía IMED
                'internal',       // Bono creado internamente
                'promotion',      // Bono promocional
                'refund'          // Bono por devolución
            ])->default('internal');
            
            $table->string('external_id')->nullable(); // ID externo (ej: ID de IMED)
            $table->json('metadata')->nullable(); // Datos adicionales del proveedor
            
            // Notas administrativas
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices compuestos para consultas frecuentes
            $table->index(['patient_id', 'status']);
            $table->index(['status', 'expiration_date']);
            $table->index(['source', 'external_id']);
        });

        // Esta migración se ejecuta después de que AMBAS tablas existan
        Schema::table('treatment_sessions', function (Blueprint $table) {
            $table->foreignId('voucher_id')->nullable()->constrained();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
