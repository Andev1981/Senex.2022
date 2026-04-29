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

        if (Schema::hasTable('plan_session_type')) {
            Schema::rename('plan_session_type', 'plan_item');
        }

        if (Schema::hasTable('plan_item')) {
            Schema::table('plan_item', function (Blueprint $table) {
                if (Schema::hasColumn('plan_item', 'session_type_id')) {
                    // Dropear por SQL directo para evitar líos de nombres de constraint
                    DB::statement('ALTER TABLE plan_item DROP COLUMN session_type_id');
                }
                
                if (!Schema::hasColumn('plan_item', 'item_id')) {
                    $table->foreignId('item_id')->after('plan_id')->constrained('items')->onDelete('cascade');
                }
            });
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
    }
};
