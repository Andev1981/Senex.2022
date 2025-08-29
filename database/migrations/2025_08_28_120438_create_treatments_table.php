<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('treatments', function (Blueprint $table) {
            $table->id();

            // Relaciones principales
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();

            // Tipo de sesión por defecto (opcional): útil como sugerencia al registrar atenciones
            $table->foreignId('default_session_type_id')->nullable()
                ->constrained('session_types')->nullOnDelete();

            // Información clínica / operativa
            $table->string('diagnosis')->nullable();

            // Flexibilidad de sesiones
            // null = indefinido; is_indefinite true facilita queries
            $table->integer('planned_sessions')->nullable();
            $table->boolean('is_indefinite')->default(false);
            $table->boolean('evaluation_required')->default(false); // evaluar en primera sesión

            // Estado del tratamiento (usa string para compatibilidad MySQL/Postgres)
            // valores esperados: active, completed, paused, indefinite, cancelled
            $table->string('status')->default('active')->index();

            // Fechas clave
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Campo libre para metadatos (acuerdos, tags, etc.)
            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices útiles
            $table->index(['patient_id', 'status']);
            $table->index(['doctor_id', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('treatments');
    }
};
