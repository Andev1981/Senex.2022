<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\TreatmentSession;
use App\Models\Invoice;
use App\Models\PatientPlan;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de pruebas para Webpay Plus
 * 
 * Este controlador sirve una interfaz de prueba para validar
 * la integración con Webpay en ambiente de desarrollo.
 * 
 * IMPORTANTE: Solo debe estar disponible en ambientes de desarrollo
 */
class WebpayTestController extends Controller
{
    /**
     * Muestra la interfaz de prueba de Webpay
     * 
     * @return Response
     */
    public function index()
    {
        $patients = Patient::select('id', 'name', 'last_name', 'rut')
            ->orderBy('name')
            ->limit(50)
            ->get();

        $sessions = TreatmentSession::with(['treatment', 'patient'])
            ->whereIn('status', ['Programada', 'Pendiente'])
            ->orderBy('date', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'patient_id' => $session->patient_id, // ✅ Ya lo tienes
                    'date' => $session->date,
                    'status' => $session->status,
                    'patient_amount_clp' => $session->patient_amount_clp,
                ];
            });

        $debts = Invoice::where('payment_status', 'unpaid')
            ->where('amount_total_clp', '>', 0)
            ->orderBy('issue_date', 'asc')
            ->limit(100)
            ->with('items')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'patient_id' => $invoice->patient_id, // ✅ Ya lo tienes
                    'concept' => 'Factura #' . $invoice->id,
                    'due_date' => $invoice->issue_date,
                    'original_amount' => $invoice->amount_total_clp,
                ];
            });

        // ⭐ NUEVO: Agregar esta sección completa
        $plans = PatientPlan::with(['patient', 'plan'])
            ->where('status', 'active')
            ->orderBy('start_date', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($patientPlan) {
                return [
                    'id' => $patientPlan->id,
                    'patient_id' => $patientPlan->patient_id,
                    'plan_name' => $patientPlan->plan->name ?? 'Plan sin nombre',
                    'total_sessions' => $patientPlan->total_sessions,
                    'sessions_used' => $patientPlan->sessions_used,
                    'remaining_sessions' => $patientPlan->remaining_sessions,
                    'price_per_session_clp' => $patientPlan->price_per_session_clp,
                    'start_date' => $patientPlan->start_date,
                    'end_date' => $patientPlan->end_date,
                    'status' => $patientPlan->status,
                ];
            });
        // ⭐ FIN NUEVO

        return Inertia::render('payments/WebpayTest', [
            'patients' => $patients,
            'sessions' => $sessions,
            'debts' => $debts,
            'plans' => $plans, // ⭐ NUEVO: Agregar esta línea
        ]);
    }
}
