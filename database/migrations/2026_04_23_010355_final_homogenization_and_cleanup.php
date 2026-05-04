<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Reconstruir tabla pivote de sucursales
        Schema::dropIfExists('branch_session_type');
        Schema::dropIfExists('branch_item');
        
        Schema::create('branch_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            
            $table->decimal('custom_price_clp', 12, 2)->nullable();
            $table->decimal('custom_doctor_commission_clp', 12, 2)->nullable();
            $table->integer('custom_duration_minutes')->nullable();
            $table->boolean('is_active_in_branch')->default(true);
            $table->string('custom_code')->nullable();
            
            $table->timestamps();
            $table->unique(['branch_id', 'item_id']);
        });

        // 2. Actualizar tablas que dependen de session_type_id
        // Nota: Las columnas item_id ya están en las migraciones maestras.
        // Aquí solo nos aseguramos de limpiar residuos si quedaran.

        // Treatment Sessions
        if (Schema::hasTable('treatment_sessions')) {
            Schema::table('treatment_sessions', function (Blueprint $table) {
                // Firma Digital y Validación de Atención (Si no están en la maestra)
                if (!Schema::hasColumn('treatment_sessions', 'signature_path')) {
                    $table->string('signature_path')->nullable();
                    $table->boolean('signature_skipped')->default(false);
                    $table->string('signature_skip_reason')->nullable();
                    $table->timestamp('signed_at')->nullable();
                    $table->string('signature_gps_coords')->nullable();
                }
            });
        }

        // 3. Limpiar Invoice Items (Polimorfismo)
        DB::table('invoice_items')
            ->whereIn('sellable_type', ['App\Models\Product', 'App\Models\SessionType'])
            ->update(['sellable_type' => 'App\Models\Item']);

        // 4. ELIMINAR TABLAS ANTIGUAS
        Schema::dropIfExists('products');
        Schema::dropIfExists('session_types');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
    }
};
