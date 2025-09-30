<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Si la tabla NO existe, créala completa ya con el esquema nuevo.
        if (!Schema::hasTable('addresses')) {
            Schema::create('addresses', function (Blueprint $t) {
                $t->engine = 'InnoDB';
                $t->id();


                // relación polimórfica
                $t->unsignedBigInteger('addressable_id');
                $t->string('addressable_type');

                // metadatos
                $t->string('type', 32)->default('other');
                $t->boolean('is_primary')->default(false);
                $t->decimal('lat', 10, 7)->nullable();
                $t->decimal('lng', 10, 7)->nullable();

                // campos típicos de dirección (ajusta a los que tengas en tu proyecto)
                $t->string('street')->nullable();
                $t->string('number')->nullable();
                $t->string('city')->nullable();
                $t->string('state')->nullable();
                $t->foreignId('commune_id')->nullable()->constrained('communes')->nullOnDelete();
                $t->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
                $t->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();
                $t->string('postal_code')->nullable();
                $t->string('details')->nullable();
                $t->string('country')->nullable();

                $t->timestamps();
            });

            return; // nada más que hacer
        }

        // Si la tabla YA existe, agregamos/ajustamos sin DBAL
        Schema::table('addresses', function (Blueprint $t) {



            // columnas polimórficas
            if (!Schema::hasColumn('addresses', 'addressable_id')) {
                $t->unsignedBigInteger('addressable_id')->nullable();
            }
            if (!Schema::hasColumn('addresses', 'addressable_type')) {
                $t->string('addressable_type')->nullable()->after('addressable_id');
            }

            // metadatos recomendados
            if (!Schema::hasColumn('addresses', 'type')) {
                $t->string('type', 32)->default('other')->after('addressable_type');
            }
            if (!Schema::hasColumn('addresses', 'is_primary')) {
                $t->boolean('is_primary')->default(false)->after('type');
            }
            if (!Schema::hasColumn('addresses', 'lat')) {
                $t->decimal('lat', 10, 7)->nullable()->after('is_primary');
            }
            if (!Schema::hasColumn('addresses', 'lng')) {
                $t->decimal('lng', 10, 7)->nullable()->after('lat');
            }

            // índice útil (si falla por existir, lo ignoramos en try/catch más abajo)
        });



        // --- BACKFILL polimórfico desde columnas antiguas si existen ---
        // (evitamos referenciar clases PHP para no depender de autoload en migración)
        if (Schema::hasColumn('addresses', 'patient_id')) {
            DB::table('addresses')
                ->whereNotNull('patient_id')
                ->whereNull('addressable_id')
                ->update([
                    'addressable_type' => 'App\\Models\\Patient',
                    'addressable_id'   => DB::raw('patient_id'),
                ]);
        }
        if (Schema::hasColumn('addresses', 'doctor_id')) {
            DB::table('addresses')
                ->whereNotNull('doctor_id')
                ->whereNull('addressable_id')
                ->update([
                    'addressable_type' => 'App\\Models\\Doctor',
                    'addressable_id'   => DB::raw('doctor_id'),
                ]);
        }
        if (Schema::hasColumn('addresses', 'branch_id')) {
            DB::table('addresses')
                ->whereNotNull('branch_id')
                ->whereNull('addressable_id')
                ->update([
                    'addressable_type' => 'App\\Models\\Branch',
                    'addressable_id'   => DB::raw('branch_id'),
                ]);
        }

        // Dropear FKs antiguas que apunten a patient_id/doctor_id/branch_id (si hubiera)
        $db = DB::getDatabaseName();
        $oldCols = ['patient_id', 'doctor_id', 'branch_id'];

        foreach ($oldCols as $col) {
            if (!Schema::hasColumn('addresses', $col)) {
                continue;
            }
            $fks = DB::select("
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'addresses'
                  AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
            ", [$db, $col]);

            foreach ($fks as $fk) {
                try {
                    DB::statement("ALTER TABLE `addresses` DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                } catch (\Throwable $e) {
                }
            }
        }

        // Dropear columnas antiguas (si existen)
        Schema::table('addresses', function (Blueprint $t) use ($oldCols) {
            foreach ($oldCols as $col) {
                if (Schema::hasColumn('addresses', $col)) {
                    try {
                        $t->dropColumn($col);
                    } catch (\Throwable $e) {
                    }
                }
            }
        });

        // Finalmente, fija NOT NULL en addressable_* SIN DBAL
        if (Schema::hasColumn('addresses', 'addressable_id')) {
            try {
                DB::statement('ALTER TABLE `addresses` MODIFY `addressable_id` BIGINT UNSIGNED NOT NULL');
            } catch (\Throwable $e) {
            }
        }
        if (Schema::hasColumn('addresses', 'addressable_type')) {
            try {
                DB::statement('ALTER TABLE `addresses` MODIFY `addressable_type` VARCHAR(255) NOT NULL');
            } catch (\Throwable $e) {
            }
        }
    }

    public function down(): void
    {
        // Si la tabla no existe, nada que revertir
        if (!Schema::hasTable('addresses')) {
            return;
        }

        // Intento prudente de rollback (no restaura datos movidos a polimórfico)
        // 1) Relajar NOT NULL
        try {
            DB::statement('ALTER TABLE `addresses` MODIFY `addressable_id` BIGINT UNSIGNED NULL');
        } catch (\Throwable $e) {
        }
        try {
            DB::statement('ALTER TABLE `addresses` MODIFY `addressable_type` VARCHAR(255) NULL');
        } catch (\Throwable $e) {
        }


        // 3) Quitar columnas agregadas (no destructivo si no existen)
        Schema::table('addresses', function (Blueprint $t) {
            foreach (['lat', 'lng', 'is_primary', 'type', 'addressable_type', 'addressable_id'] as $col) {
                if (Schema::hasColumn('addresses', $col)) {
                    try {
                        $t->dropColumn($col);
                    } catch (\Throwable $e) {
                    }
                }
            }
        });
    }
};
