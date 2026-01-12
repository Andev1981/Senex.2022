<?php

// app/Services/FamilyPlanService.php

namespace App\Services\Plans;

use App\Models\Patient;
use App\Models\Plan;
use App\Models\PatientPlan;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class FamilyPlanService
{
    /**
     * Valida que los pacientes no tengan otra cobertura activa.
     *
     * @param array $patientIds IDs de los pacientes a añadir (incluido el titular).
     * @throws \Exception Si se encuentra una cobertura activa.
     */
    protected function validateNoActiveCoverage(array $patientIds): void
    {
        // Busca cualquier registro activo para los pacientes proporcionados
        $activePlans = PatientPlan::active()
            ->whereIn('patient_id', $patientIds)
            ->with('plan')
            ->get();

        if ($activePlans->isNotEmpty()) {
            $patientName = $activePlans->first()->patient->full_name;
            $planName = $activePlans->first()->plan->name;
            
            throw new \Exception(
                "El paciente '{$patientName}' ya tiene el plan activo '{$planName}'. Desactive la cobertura anterior antes de asignarle una nueva."
            );
        }
    }

    /**
     * Asigna un Plan Familiar a un grupo de pacientes.
     *
     * @param Plan $plan El plan maestro (debe tener is_family = true).
     * @param int $holderId ID del paciente titular.
     * @param array $beneficiaryIds IDs de los pacientes beneficiarios.
     * @throws \Exception
     */
    public function assignFamilyPlan(Plan $plan, int $holderId, array $beneficiaryIds): void
    {
        if (!$plan->is_family) {
            throw new \Exception("El plan {$plan->name} no está marcado como Plan Familiar.");
        }

        $allMembers = array_merge([$holderId], $beneficiaryIds);

        DB::beginTransaction();
        try {
            // 1. Verificar la restricción de unicidad
            $this->validateNoActiveCoverage($allMembers);
            
            // 2. Generar el UUID único para este nuevo contrato
            $contractUuid = Str::uuid(); 
            
            // 3. Crear la instancia para el Titular
            PatientPlan::create([
                'plan_id' => $plan->id,
                'patient_id' => $holderId,
                'contract_uuid' => $contractUuid,
                'role' => 'holder',
                'active' => 'active',
                // ... otros campos necesarios de PatientPlan (fechas, etc.)
            ]);

            // 4. Crear instancias para los Beneficiarios
            foreach ($beneficiaryIds as $beneficiaryId) {
                PatientPlan::create([
                    'plan_id' => $plan->id,
                    'patient_id' => $beneficiaryId,
                    'contract_uuid' => $contractUuid, // Usamos el mismo UUID
                    'role' => 'beneficiary',
                    'active' => 'active',
                    // ... otros campos
                ]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            // Re-lanzamos la excepción para que el controlador la maneje
            throw $e; 
        }
    }
}