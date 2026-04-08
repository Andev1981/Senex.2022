<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Treatment;
use App\Enums\AppointmentStatusEnum;
use App\Enums\TreatmentStatusEnum;
use Illuminate\Support\Facades\DB;

class SyncTreatmentCountersCommand extends Command
{
    protected $signature = 'treatments:sync-counters {--fix : Aplica los cambios en la base de datos}';
    protected $description = 'Sincroniza el contador de sesiones completadas y el estado de los tratamientos basados en la realidad de las sesiones.';

    public function handle()
    {
        $fix = $this->option('fix');
        $treatments = Treatment::withCount(['sessions' => function ($query) {
            $query->where('status', AppointmentStatusEnum::COMPLETED);
        }])->get();

        $this->info("Analizando " . $treatments->count() . " tratamientos...");
        $updatedCount = 0;
        $closedCount = 0;

        foreach ($treatments as $treatment) {
            $realCompleted = $treatment->sessions_count;
            $needsUpdate = false;

            // 1. Verificar si el contador está desfasado
            if ($treatment->completed_sessions !== $realCompleted) {
                $this->line("Tratamiento ID {$treatment->id}: Contador {$treatment->completed_sessions} -> {$realCompleted}");
                if ($fix) {
                    $treatment->completed_sessions = $realCompleted;
                    $needsUpdate = true;
                }
            }

            // 2. Verificar si debe cerrarse automáticamente
            if ($treatment->total_sessions > 0 && $realCompleted >= $treatment->total_sessions) {
                if ($treatment->status !== TreatmentStatusEnum::COMPLETED) {
                    $this->warn("Tratamiento ID {$treatment->id}: Debe cerrarse ({$realCompleted}/{$treatment->total_sessions})");
                    if ($fix) {
                        $treatment->status = TreatmentStatusEnum::COMPLETED;
                        $needsUpdate = true;
                        $closedCount++;
                    }
                }
            }

            if ($needsUpdate) {
                $treatment->save();
                $updatedCount++;
            }
        }

        if ($fix) {
            $this->info("Sincronización completada. Actualizados: {$updatedCount}, Cerrados: {$closedCount}");
        } else {
            $this->warn("MODO PREVIEW: No se aplicaron cambios. Usa --fix para ejecutar.");
        }
    }
}
