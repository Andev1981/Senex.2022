<?php

namespace App\Services;

use App\Models\AgreementRule;
use App\Models\Patient;
use App\Models\PatientPlan;
use Illuminate\Support\Facades\Log;

class AgreementService
{
    /**
     * Obtiene la regla de convenio aplicable para un paciente y un ítem específico.
     * Prioriza la búsqueda por el plan específico del paciente.
     */
    public function getApplicableRule(int $patientId, int $itemId): ?AgreementRule
    {
        $patient = Patient::with(['activeExternalPlans.plan'])->find($patientId);
        
        if (!$patient) return null;

        // 1. Buscar en los planes externos (Isapres) activos del paciente
        foreach ($patient->activeExternalPlans as $patientPlan) {
            $plan = $patientPlan->plan;
            
            if (!$plan || $plan->type !== 'external') continue;

            // Intentar encontrar una regla que coincida con este Plan y este Item
            $rule = AgreementRule::where('plan_id', $plan->id)
                ->where('item_id', $itemId)
                ->whereHas('agreement', function($q) {
                    $q->where('is_active', true);
                })
                ->first();

            if ($rule) {
                return $rule;
            }

            // 2. Si no hay regla por plan específico, buscar regla general de la Aseguradora para ese ítem
            $generalRule = AgreementRule::whereNull('plan_id')
                ->where('item_id', $itemId)
                ->whereHas('agreement', function($q) use ($plan) {
                    $q->where('insurance_id', $plan->insurance_id)
                      ->where('is_active', true);
                })
                ->first();

            if ($generalRule) {
                return $generalRule;
            }
        }

        return null;
    }
}
