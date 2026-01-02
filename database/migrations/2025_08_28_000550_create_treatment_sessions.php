<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('treatment_sessions', function (Blueprint $table) {
      $table->id();

      // -----------------------------------------------------
      // 1. CONTEXTO Y RELACIONES
      // -----------------------------------------------------
      $table->foreignId('company_id')->constrained()->comment('Empresa dueña del registro');
      $table->foreignId('branch_id')->nullable()->constrained()->onDelete('restrict');

      // Relación Madre: Si borran el tratamiento, se borran las sesiones
      $table->foreignId('treatment_id')->constrained()->cascadeOnDelete();

      $table->foreignId('patient_id')->constrained()->cascadeOnDelete();

      // OJO: Si tus doctores son usuarios del sistema, usa 'users'. Si tienes tabla 'doctors', usa esa.
      $table->foreignId('doctor_id')->constrained('users')->restrictOnDelete();

      $table->foreignId('session_type_id')->nullable()->constrained()->nullOnDelete();

      // Logística de Citas
      $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete();

      // -----------------------------------------------------
      // 2. LOGÍSTICA DE LA SESIÓN
      // -----------------------------------------------------
      $table->date('date')->index();
      $table->time('time')->nullable();
      $table->unsignedSmallInteger('duration')->default(45)->comment('Duración en minutos');

      // Typos corregidos y estados estándar
      $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'])
        ->default('scheduled')
        ->index();

      $table->unsignedTinyInteger('month_session_number')->default(1)->comment('Sesión N° X del mes para el paciente');
      $table->boolean('consumes_plan')->default(true)->comment('Si descuenta del total del tratamiento');
      $table->text('cancellation_note')->nullable();

      // -----------------------------------------------------
      // 3. DATOS CLÍNICOS (ESTRUCTURA SOAP)
      // -----------------------------------------------------

      // [S]UBJECTIVE: Lo que el paciente relata
      $table->text('subjective')->nullable()->comment('S: Motivo específico hoy, dolor relatado, sensaciones.');

      // [O]BJECTIVE: Lo que el Kine mide (Datos Duros)
      // Reemplaza a las columnas rom_flexion, pain_before, etc.
      /* Estructura:
               {
                 "pain": { "pre": 7, "post": 4 }, // EVA
                 "biometrics": [
                    { "type": "ROM", "segment": "Rodilla", "mov": "Flexión", "pre": 90, "post": 100 },
                    { "type": "Fuerza", "segment": "Cuadriceps", "val": "M4" }
                 ],
                 "vitals": { "bp": "120/80", "hr": 70 }
               }
            */
      $table->json('biometric_data')->nullable()->comment('O: Datos objetivos, mediciones y ROMs dinámicos');
      $table->json('attachments')->nullable()->comment('Rutas de fotos/archivos adjuntos a la sesión');

      // [A]SSESSMENT: Análisis profesional y Actividades realizadas
      $table->text('assessment')->nullable()->comment('A: Análisis de la evolución y notas técnicas');
      $table->json('techniques')->nullable()->comment('Listado de técnicas aplicadas (JSON Array)');
      $table->json('exercises')->nullable()->comment('Listado de ejercicios realizados (JSON Array)');

      // [P]LAN: Planificación futura
      $table->text('plan')->nullable()->comment('P: Tareas para el hogar y objetivos próxima sesión');

      // -----------------------------------------------------
      // 4. FINANZAS (SNAPSHOT)
      // -----------------------------------------------------
      // Guardamos el valor histórico al momento de la sesión
      $table->unsignedBigInteger('patient_amount_clp')->default(0);
      $table->unsignedBigInteger('doctor_amount_clp')->default(0);
      $table->unsignedBigInteger('clinic_amount_clp')->default(0);
      $table->boolean('is_exento')->default(true);
      $table->boolean('dte_generated')->default(false)->comment('Indica si ya fue o no generada una dte o factura o boleta para ese servicio');

      // -----------------------------------------------------
      // 5. METADATA Y TIMESTAMPS
      // -----------------------------------------------------
      $table->json('meta')->nullable()->comment('Datos extra del sistema o integraciones');
      $table->timestamps();
      $table->softDeletes();

      // Índices Optimizados
      $table->index(['patient_id', 'date'], 'idx_patient_history'); // Para ver historial rápido
      $table->index(['doctor_id', 'date'], 'idx_doctor_agenda');    // Para ver agenda del doctor
      $table->index(['treatment_id', 'status']); // Para contar sesiones realizadas de un tratamiento
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('treatment_sessions');
  }
};
