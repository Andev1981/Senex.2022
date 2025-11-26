<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TreatmentSession;

class FixTreatmentSessionJson extends Command
{
    protected $signature = 'fix:treatment-session-json';
    protected $description = 'Repara los campos techniques y exercises que fueron guardados como strings en lugar de JSON real';

    public function handle()
    {
        $sessions = TreatmentSession::all();
        $count = 0;

        foreach ($sessions as $s) {

            $changed = false;

            // Reparar techniques si viene como string
            if (is_string($s->techniques)) {
                $decoded = json_decode($s->techiques, true);

                if ($decoded !== null && is_array($decoded)) {
                    $this->info("Reparando techniques en session #{$s->id}");
                    $s->techniques = $decoded;
                    $changed = true;
                }
            }

            // Reparar exercises si viene como string
            if (is_string($s->exercises)) {
                $decoded = json_decode($s->exercises, true);

                if ($decoded !== null && is_array($decoded)) {
                    $this->info("Reparando exercises en session #{$s->id}");
                    $s->exercises = $decoded;
                    $changed = true;
                }
            }

            if ($changed) {
                $s->save();
                $count++;
            }
        }

        $this->info("✔ Reparación completada. Registros corregidos: {$count}");

        return 0;
    }
}
