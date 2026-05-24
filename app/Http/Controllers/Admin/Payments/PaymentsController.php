<?php

namespace App\Http\Controllers\Admin\Payments;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Models\Patient;
use App\Models\Plan;
use App\Models\Item;
use App\Models\Doctor;
use App\Services\Payments\PaymentService;
use App\Services\Invoices\InvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PaymentsController extends Controller
{
    public function index()
    {
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');
        $company = \App\Models\Company::find($currentCompanyId);
        $businessType = $company->business_type->value ?? 'clinical';
        $isClinical = $businessType === 'clinical';

        $insurances = $isClinical ? Insurance::where('company_id', $currentCompanyId)->get(['id', 'name']) : collect();
        $plans = $isClinical ? Plan::whereIn('insurance_id', $insurances->pluck('id'))->get(['id', 'name', 'insurance_id', 'code']) : collect();
        
        $doctors = Doctor::where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                $query->whereHas('branches', function ($q) use ($activeBranchId) {
                    $q->where('branches.id', $activeBranchId);
                });
            })
            ->get(['id', 'name', 'last_name']);

        // Obtener catálogo unificado para la caja
        $items = Item::where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->get(['id', 'name', 'price', 'type', 'sku', 'is_exempt'])
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => (int)$p->price,
                    'is_exempt' => (bool)$p->is_exempt,
                    'sellable_type' => 'Item',
                    'type' => $p->type,
                    'sku' => $p->sku
                ];
            });

        $patients = Patient::when($activeBranchId, function ($query) use ($activeBranchId) {
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->get(['id', 'name', 'last_name', 'rut', 'phone', 'email'])
        ->map(function($p) {
            return [
                'id' => 'person_' . $p->id,
                'db_id' => $p->id,
                'full_name' => $p->name . ' ' . $p->last_name,
                'rut' => $p->rut,
                'type' => 'person',
                'label' => '👤 ' . $p->name . ' ' . $p->last_name . ' (' . $p->rut . ')'
            ];
        });

        $corporateClients = \App\Models\CompanyDirectory::where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->get(['id', 'business_name', 'rut', 'email', 'phone'])
            ->map(function($c) {
                return [
                    'id' => 'company_' . $c->id,
                    'db_id' => $c->id,
                    'full_name' => $c->business_name,
                    'rut' => $c->rut,
                    'type' => 'company',
                    'label' => '🏢 ' . $c->business_name . ' (' . $c->rut . ')'
                ];
            });

        $patients = $patients->concat($corporateClients);

        $regions = \Illuminate\Support\Facades\Cache::remember('geo_regions', 86400, fn() => \App\Models\Region::get(['id', 'name']));
        $communes = \Illuminate\Support\Facades\Cache::remember('geo_communes', 86400, fn() => \App\Models\Commune::get(['id', 'name', 'region_id']));

        return Inertia::render('billing-checkout/index', [
            'insurances' => $insurances,
            'plans' => $plans,
            'items' => $items,
            'patients' => $patients,
            'isClinical' => $isClinical,
            'doctors' => $doctors,
            'regions' => $regions,
            'communes' => $communes,
            'paymentMethods' => \App\Enums\PaymentMethodEnum::options(),
            'agreements' => \App\Models\Agreement::where('company_id', $currentCompanyId)
                ->where('is_active', true)
                ->with(['rules' => function($q) {
                    $q->select('id', 'agreement_id', 'item_id', 'plan_id', 'patient_share_clp', 'insurance_share_clp', 'patient_percentage');
                }])
                ->get(['id', 'name', 'insurance_id']),
            'business_type' => $businessType
        ]);
    }

    public function store(Request $request)
    {
        return $this->processPayment($request);
    }

    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|string',
            'amount_clp' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'services_to_bill' => 'nullable|array',
            'final_shares' => 'nullable|array',
            'session_ids' => 'nullable|array',
            'is_pos' => 'boolean'
        ]);

        try {
            $paymentService = app(\App\Services\Payments\PaymentService::class);
            $invoiceService = app(\App\Services\Invoices\InvoiceService::class);

            return DB::transaction(function() use ($validated, $paymentService, $invoiceService) {
                // 1. Registrar el Pago (Recaudación)
                $payment = $paymentService->registerLocalPayment($validated);

                // 2. Si hay servicios a facturar (flujo POS)
                if (!empty($validated['services_to_bill'])) {
                    
                    // 🎯 DETECTAR SI ES COMPRA DE PACK (PLAN)
                    // En Senex, los Packs no emiten boleta inmediata para permitir reembolsos por sesión
                    $plans = collect($validated['services_to_bill'])->filter(fn($s) => ($s['sellable_type'] ?? '') === 'Plan' || ($s['type'] ?? '') === 'plan');
                    
                    if ($plans->isNotEmpty()) {
                        foreach ($plans as $p) {
                            $planId = $p['id'] ?? $p['sellable_id'];
                            app(\App\Services\Plans\PlanService::class)->purchasePlan($payment->patient_id, $planId, $payment->id);
                        }

                        // Si SOLO hay planes, retornamos éxito sin Invoice (DTE diferido)
                        if ($plans->count() === count($validated['services_to_bill'])) {
                            return response()->json([
                                'status' => 'success',
                                'success' => true,
                                'payment_id' => $payment->id,
                                'url' => route('payments.success', $payment->uuid),
                                'message' => 'Pack activado exitosamente. Las boletas se generarán por cada atención.'
                            ]);
                        }
                    }

                    // Flujo estándar para ítems normales (Boleta inmediata)
                    $invoice = $invoiceService->processInvoice($payment, $validated, $validated['is_pos'] ?? false);
                    
                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'payment_id' => $payment->id,
                        'invoice_id' => $invoice->id,
                        'dte_status' => $invoice->dte_status,
                        'url' => route('payments.success', $payment->uuid),
                        'message' => 'Pago procesado exitosamente'
                    ]);
                }

                // 3. Flujo Manual (desde perfil de paciente)
                return response()->json([
                    'status' => 'success',
                    'success' => true,
                    'payment_id' => $payment->id,
                    'message' => 'Recaudación registrada exitosamente',
                    'url' => route('payments.success', $payment->uuid)
                ]);
            });

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error procesando pago', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPatientStatus($id)
    {
        $patientId = str_replace('person_', '', $id);
        
        // 1. Sesiones completadas pero no facturadas (DTE)
        $patient = Patient::with(['treatments.sessions' => function($q) {
            $q->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
              ->where('dte_generated', false)
              ->with(['item', 'doctor']);
        }])->findOrFail($patientId);

        $pendingSessions = $patient->treatments->flatMap->sessions;

        // 2. Mapear sesiones como "deudas" para que la caja las vea
        $debts = $pendingSessions->map(function($session) {
            return [
                'id' => 'session_' . $session->id,
                'amount_patient_clp' => $session->patient_amount_clp ?? $session->item?->price ?? 0,
                'treatment_session' => $session,
                'treatment_session_id' => $session->id,
                'type' => 'pending_session'
            ];
        });

        // 3. Planes Activos (para el selector de planes en cada item)
        $activePlans = $patient->activePlans()
            ->with('plan')
            ->get()
            ->map(function($pp) {
                return [
                    'id' => $pp->id,
                    'plan_id' => $pp->plan_id,
                    'plan_name' => $pp->plan->name,
                    'item_id' => $pp->plan->item_id ?? null,
                    'available' => $pp->remaining_sessions,
                    'total' => $pp->total_sessions
                ];
            });

        // 4. Cobertura Predefinida
        $insurance = $patient->insurance()->with(['insurance', 'plan'])->first();

        return response()->json([
            'debts' => $debts,
            'activePlans' => $activePlans,
            'active_plans' => $activePlans, // Retrocompatibilidad
            'insurance' => $insurance
        ]);
    }

    public function success($uuid)
    {
        $payment = \App\Models\Payment::where('uuid', $uuid)
            ->with(['patient', 'branch', 'paymentAllocations.invoice.items', 'paymentAllocations.treatmentSession.item', 'receivables.insurance'])
            ->firstOrFail();

        $invoice = $payment->paymentAllocations->first()?->invoice;
        
        return Inertia::render('billing-checkout/Success', [
            'payment' => $payment,
            'invoice' => $invoice,
            'is_dte_pending' => $invoice ? $invoice->dte_status === \App\Enums\DteStatusEnum::PENDING : false
        ]);
    }

    public function downloadReceiptPdf($uuid)
    {
        $payment = \App\Models\Payment::where('uuid', $uuid)
            ->with(['patient', 'branch', 'paymentAllocations.invoice.items', 'paymentAllocations.treatmentSession.item', 'receivables.insurance'])
            ->firstOrFail();
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.payment_receipt', [
            'payment' => $payment,
            'company' => $payment->company
        ]);

        return $pdf->stream("comprobante-pago-{$payment->id}.pdf");
    }

    public function abortPos(Request $request)
    {
        // Lógica para cancelar un cobro en el terminal si fuera necesario
        return response()->json(['status' => 'ok']);
    }
}
