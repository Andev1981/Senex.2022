<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\SessionType;

class FixCompanyOneSeeder extends Seeder
{
    public function run()
    {
        $plan = Plan::first();
        if ($plan) {
            // Check if Co 1 already has plans
            if (Plan::where('company_id', 1)->count() == 0) {
                $newPlan = $plan->replicate();
                $newPlan->company_id = 1;
                $newPlan->name = $newPlan->name . ' (Co 1)';
                $newPlan->save();
                $this->command->info('Plan replicated to Company 1');
            }
        }

        $session = SessionType::first();
        if ($session) {
            // Check if Co 1 already has sessions
            if (SessionType::where('company_id', 1)->count() == 0) {
                $newSession = $session->replicate();
                $newSession->company_id = 1;
                $newSession->name = $newSession->name . ' (Co 1)';
                $newSession->save();
                $this->command->info('SessionType replicated to Company 1');
            }
        }
    }
}
