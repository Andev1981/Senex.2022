<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Quien crea la orden
            
            $table->string('number')->unique(); // Folio interno
            $table->date('date');
            $table->string('status')->default('pending'); // pending, approved, received, cancelled
            
            $table->bigInteger('net_amount_clp')->default(0);
            $table->bigInteger('tax_amount_clp')->default(0);
            $table->bigInteger('total_amount_clp')->default(0);
            
            $table->text('observations')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Detalle de la orden (Items)
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->string('description');
            $table->integer('quantity');
            $table->bigInteger('unit_price_clp');
            $table->bigInteger('total_price_clp');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
