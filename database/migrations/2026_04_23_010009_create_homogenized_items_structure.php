<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla base de Items
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('type', ['product', 'service'])->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku')->nullable()->index(); // Código único (SKU o Código de Prestación)
            
            $table->decimal('price', 12, 2)->default(0);
            $table->boolean('is_exempt')->default(false); // Si es exento de IVA (Crucial para DTE)
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Un SKU debe ser único por empresa
            $table->unique(['company_id', 'sku']);
        });

        // 2. Detalles específicos de Productos (Inventario)
        Schema::create('product_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            
            $table->string('barcode')->nullable()->index();
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('critical_stock')->default(0);
            $table->boolean('manage_stock')->default(true);
            
            $table->timestamps();
        });

        // 3. Detalles específicos de Servicios (Salud/Sesiones)
        Schema::create('service_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            
            $table->integer('duration_minutes')->default(30);
            $table->boolean('requires_diagnosis')->default(false);
            $table->boolean('requires_referral')->default(false);
            $table->decimal('default_doctor_commission_clp', 12, 2)->nullable();
            $table->string('specialty')->nullable()->index(); // Ej: Kinesiología, Nutrición
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_details');
        Schema::dropIfExists('product_details');
        Schema::dropIfExists('items');
    }
};
