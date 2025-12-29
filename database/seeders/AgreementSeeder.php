<?php

namespace Database\Seeders;

use App\Models\Agreement;
use App\Models\AgreementRule;
use App\Models\Company;
use App\Models\Insurance;
use App\Models\Plan;
use App\Models\SessionType;
use Illuminate\Database\Seeder;

class AgreementSeeder extends Seeder
{
    public function run(array $parameters = null)
    {
        $company = $parameters['company'];
        $insurances = Insurance::where('company_id', $company->id)->get();
        $sessionTypes = SessionType::where('company_id', $company->id)->get();

        foreach ($insurances as $insurance) {
            $agreement = Agreement::create([
                'company_id' => $company->id,
                'insurance_id' => $insurance->id,
                'name' => 'Convenio ' . $insurance->name,
                'version' => '1.0',
                'is_active' => true,
                'start_date' => now(),
            ]);

            $plans = Plan::where('insurance_id', $insurance->id)->get();

            foreach ($plans as $plan) {
                foreach ($sessionTypes as $sessionType) {
                    AgreementRule::create([
                        'agreement_id' => $agreement->id,
                        'plan_id' => $plan->id,
                        'session_type_id' => $sessionType->id,
                        'gross_price_clp' => $sessionType->base_price_clp * 0.9, // 10% discount
                        'patient_share_clp' => $sessionType->base_price_clp * 0.2, // 20% copay
                        'insurance_share_clp' => $sessionType->base_price_clp * 0.7, // 70% coverage
                        'patient_percentage' => 20,
                        'insurance_percentage' => 70,
                    ]);
                }
            }
        }
    }
}
