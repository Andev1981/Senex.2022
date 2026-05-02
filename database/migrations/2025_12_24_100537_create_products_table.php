<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

            // Identificación
            $table->enum('type', ['product', 'service'])->default('product')->index();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('sku')->nullable()->comment('Código interno (Stock Keeping Unit)');
            $table->string('barcode')->nullable()->comment('Código de barras EAN/UPC escaneable');

            // Precios e Impuestos
            $table->decimal('cost_price', 10, 0)->default(0)->comment('Costo neto de compra');
            $table->decimal('price', 10, 0)->comment('Precio de venta final (PVP)');
            $table->boolean('is_exempt')->default(false)->comment('Si es true, no paga IVA');

            // Inventario
            $table->integer('stock')->default(0);
            $table->integer('critical_stock')->default(5)->comment('Alerta de stock bajo');
            $table->boolean('manage_stock')->default(true)->comment('Si es falso, es un producto infinito o servicio');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices para búsqueda rápida en el POS
            $table->unique(['company_id', 'sku']);
            $table->index(['company_id', 'barcode']);
            $table->index(['company_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
