<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {



        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade')->comment('Usuario asociado para acceso al portal (Portal Paciente).');
            $table->foreignId('company_id')->constrained()->after('id')->comment('Llave foránea a la empresa dueña de este registro.');
            $table->string('name');
            $table->string('last_name');
            $table->string('rut', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'unknown'])->nullable();


            $table->string('occupation')->nullable();
            $table->string('marital_status')->nullable();



            $table->enum('status', ['active', 'inactive', 'deceased', 'transferred', 'archived'])->default('active');
            $table->text('status_reason')->nullable();      // motivo del último cambio
            $table->timestamp('status_changed_at')->nullable();

            $table->boolean('opt_out_reminders')->default(0);
            $table->boolean('prefers_whatsapp')->default(0);
            $table->boolean('prefers_sms')->default(0);
            $table->boolean('prefers_mail')->default(0);

            $table->boolean('require_tutor')->default(0);

            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices
            $table->unique('rut');                          // único (varios NULL permitidos)
            $table->index(['last_name', 'name']);          // búsqueda por nombre
            $table->index('email');
            $table->index('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
