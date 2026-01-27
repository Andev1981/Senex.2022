<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\SessionType;

class PlanSessionTypeSeeder extends Seeder
{
    public function run()
    {
        // Obtener planes y tipos de sesión
        $plans = Plan::all();
        $sessionTypes = SessionType::all();

        if ($plans->isEmpty() || $sessionTypes->isEmpty()) {
            return;
        }

        foreach ($plans as $plan) {
            // Vincular entre 1 y 3 tipos de sesión aleatorios a cada plan
            $typesToLink = $sessionTypes->random(rand(1, min(3, $sessionTypes->count())));
            
            foreach ($typesToLink as $type) {
                // Vincular con datos del pivot
                $plan->sessionTypes()->syncWithoutDetaching([
                    $type->id => ['max_sessions' => rand(5, 15)]
                ]);
            }
        }
    }
}
