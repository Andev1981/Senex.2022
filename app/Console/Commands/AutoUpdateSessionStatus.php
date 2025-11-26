<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AutoUpdateSessionStatus extends Command
{
    /**
     * Nombre y firma del comando
     */
    protected $signature = 'sessions:auto-update-status';

    /**
     * Descripción del comando
     */
    protected $description = 'Actualiza automáticamente el estado de las sesiones según tiempo transcurrido';

    /**
     * Ejecuta el comando
     */
    public function handle()
{
    $this->info('🔄 Iniciando actualización automática de estados...');
    
    $updatedCount = 0;
    $now = Carbon::now();

    // ============================================
    // 1. Sesiones PROGRAMADAS que ya pasaron
    // ============================================
    $this->info('📅 Buscando sesiones programadas vencidas...');
    
    $scheduledSessions = TreatmentSession::where('status', 'scheduled')
        ->whereDate('date', '<=', $now->toDateString())
        ->get();

    foreach ($scheduledSessions as $session) {
        try {
            // Extraer solo la fecha (sin hora)
            $dateOnly = Carbon::parse($session->date)->format('Y-m-d');
            
            // Extraer solo la hora (sin fecha)
            $timeOnly = Carbon::parse($session->time)->format('H:i:s');
            
            // Combinar correctamente
            $sessionDateTime = Carbon::parse($dateOnly . ' ' . $timeOnly);
            
            $gracePeriod = 30; // 30 minutos de margen
            
            // Si pasó la hora + 30 minutos → AUSENTE
            if ($now->diffInMinutes($sessionDateTime, false) < -$gracePeriod) {
                $session->update([
                    'status' => 'absent',
                    'notes' => ($session->notes ?? '') . "\n\n[AUTO] Marcada como ausente automáticamente el " . $now->format('Y-m-d H:i:s')
                ]);
                
                $this->warn("  ❌ Sesión #{$session->id} → AUSENTE (programada para {$sessionDateTime->format('Y-m-d H:i')})");
                $updatedCount++;
                
                Log::info("Sesión #{$session->id} marcada como AUSENTE automáticamente", [
                    'patient' => $session->patient->full_name ?? 'N/A',
                    'doctor' => $session->doctor->full_name ?? 'N/A',
                    'scheduled_for' => $sessionDateTime->format('Y-m-d H:i'),
                    'checked_at' => $now->format('Y-m-d H:i'),
                ]);
            }
        } catch (\Exception $e) {
            $this->error("  ⚠️ Error procesando sesión #{$session->id}: " . $e->getMessage());
            Log::error("Error procesando sesión #{$session->id}", [
                'error' => $e->getMessage(),
                'date' => $session->date,
                'time' => $session->time,
            ]);
        }
    }

    // ============================================
    // 2. Sesiones EN CURSO que ya deberían terminar
    // ============================================
    $this->info('⏱️  Buscando sesiones en curso vencidas...');
    
    $inProgressSessions = TreatmentSession::where('status', 'in_progress')
        ->whereDate('date', '<=', $now->toDateString())
        ->get();

    foreach ($inProgressSessions as $session) {
        try {
            // Extraer solo la fecha (sin hora)
            $dateOnly = Carbon::parse($session->date)->format('Y-m-d');
            
            // Extraer solo la hora (sin fecha)
            $timeOnly = Carbon::parse($session->time)->format('H:i:s');
            
            // Combinar correctamente
            $sessionDateTime = Carbon::parse($dateOnly . ' ' . $timeOnly);
            $endTime = $sessionDateTime->copy()->addMinutes($session->duration);
            $gracePeriod = 15; // 15 minutos extra después de la duración
            
            // Si pasó la hora de fin + 15 minutos → COMPLETADA
            if ($now->diffInMinutes($endTime, false) < -$gracePeriod) {
                $session->update([
                    'status' => 'completed',
                    'notes' => ($session->notes ?? '') . "\n\n[AUTO] Completada automáticamente el " . $now->format('Y-m-d H:i:s')
                ]);
                
                $this->info("  ✅ Sesión #{$session->id} → COMPLETADA (terminaba a las {$endTime->format('H:i')})");
                $updatedCount++;
                
                Log::info("Sesión #{$session->id} completada automáticamente", [
                    'patient' => $session->patient->full_name ?? 'N/A',
                    'doctor' => $session->doctor->full_name ?? 'N/A',
                    'scheduled_for' => $sessionDateTime->format('Y-m-d H:i'),
                    'duration' => $session->duration,
                    'checked_at' => $now->format('Y-m-d H:i'),
                ]);
            }
        } catch (\Exception $e) {
            $this->error("  ⚠️ Error procesando sesión #{$session->id}: " . $e->getMessage());
            Log::error("Error procesando sesión #{$session->id}", [
                'error' => $e->getMessage(),
                'date' => $session->date,
                'time' => $session->time,
            ]);
        }
    }

    // ============================================
    // 3. Resumen
    // ============================================
    $this->info('');
    $this->info("✅ Proceso completado: {$updatedCount} sesiones actualizadas");
    
    Log::info("AutoUpdateSessionStatus completado", [
        'updated_count' => $updatedCount,
        'executed_at' => $now->format('Y-m-d H:i:s'),
    ]);

    return Command::SUCCESS;
}
}