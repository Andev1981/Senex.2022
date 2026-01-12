<?php

namespace App\Services\Debts;

use App\Models\Debt;
use App\Models\InvoiceItem;
use App\Models\TreatmentSession;
use App\Models\SessionType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DebtService
{
    /**
     * Crea una deuda y su detalle (Snapshot) a partir de una sesión
     */
    public function createFromSession(TreatmentSession $session, ?int $customAmount = null): Debt
    {
        return DB::transaction(function () use ($session, $customAmount) {

            $amount = $customAmount ?? ($session->patient_amount_clp > 0 ? $session->patient_amount_clp : 30000);

            // 1. Crear la Deuda (La obligación global)
            $debt = Debt::create([
                'company_id'           => $session->company_id ?? 1,
                'patient_id'           => $session->patient_id,
                'doctor_id'            => $session->doctor_id,
                'treatment_id'         => $session->treatment_id,
                'treatment_session_id' => $session->id,
                'original_amount'      => $amount,
                'paid_amount'          => 0,
                'status'               => 'pending',
                'due_date'             => Carbon::parse($session->date)->addDays(7),
            ]);

            // 2. Crear el Item (El detalle congelado)
            $sessionType = SessionType::find($session->session_type_id);
            $description = $sessionType ? "Sesión: {$sessionType->name}" : "Atención Kinesiológica";

            InvoiceItem::create([
                'debt_id'              => $debt->id,
                'treatment_session_id' => $session->id,
                'description'          => $description,
                'amount'               => $amount,
                'quantity'             => 1,
                // Datos para facturación futura
                'company_id'           => $session->company_id ?? 1,
                'branch_id'            => $session->branch_id ?? 1,
                'unit_price_clp'       => $amount,
                'total_gross_amount'   => $amount,
                'patient_share_clp'    => $amount,
                'insurance_share_clp'  => 0,
            ]);

            Log::info('DebtService: Deuda creada', ['debt_id' => $debt->id]);

            return $debt;
        });
    }

    // Aquí a futuro podrías agregar métodos como:
    // public function markAsOverdue() { ... }
    // public function getBalanceForPatient($id) { ... }
}
