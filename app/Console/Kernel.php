<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        // Ejecutar cada 15 minutos
        $schedule->command('sessions:auto-update-status')
            ->everyFifteenMinutes()
            ->withoutOverlapping()  // Evita ejecuciones simultáneas
            ->runInBackground();     // No bloquea otras tareas
        
        // O si prefieres cada hora:
        // $schedule->command('sessions:auto-update-status')->hourly();
        
        // O cada 30 minutos:
        // $schedule->command('sessions:auto-update-status')->everyThirtyMinutes();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
