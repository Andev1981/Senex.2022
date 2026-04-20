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
        Schema::table('companies_directory', function (Blueprint $table) {
            $table->foreignId('company_id')->after('id')->constrained()->onDelete('cascade');
            $table->string('giro')->nullable()->after('business_name');
            $table->string('email')->nullable()->after('giro');
            $table->string('phone')->nullable()->after('email');
            $table->string('address')->nullable()->after('phone');
            $table->foreignId('commune_id')->nullable()->after('address')->constrained();
            $table->boolean('is_active')->default(true)->after('last_api_sync_at');
            
            // Eliminamos el rut único global para que cada tenant tenga su propio directorio
            $table->dropUnique(['rut']);
            $table->unique(['company_id', 'rut']);
        });
    }

    public function down(): void
    {
        Schema::table('companies_directory', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'rut']);
            $table->unique(['rut']);
            $table->dropForeign(['company_id']);
            $table->dropForeign(['commune_id']);
            $table->dropColumn(['company_id', 'giro', 'email', 'phone', 'address', 'commune_id', 'is_active']);
        });
    }
};
