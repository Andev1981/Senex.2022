<?php

namespace App\Http\Controllers\Admin\Payments;

use App\Enums\PaymentMethodEnum;
use App\Enums\DteStatusEnum;
use App\Enums\FinanceStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Jobs\Dte\EmitDteJob;
use App\Models\Agreement;
use App\Models\Doctor;
use App\Models\Insurance;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\PatientPlan;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\SessionType;
use App\Models\TreatmentSession;
use App\Services\Invoices\InvoiceService;
use App\Services\Payments\PaymentService;
use App\Services\Payments\WebpayPlusService;
use App\Services\PosService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Pdf;

class PaymentsController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private InvoiceService $invoiceService,
        private WebpayPlusService $webpayService,
        private PosService $posService
    ) {}

    public function index()
    {
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');
        $company = \App\Models\Company::find($currentCompanyId);
        $businessType = $company->business_type->value ?? 'clinical';
        $isClinical = $businessType === 'clinical';

        $insurances = $isClinical ? Insurance::where('company_id', $currentCompanyId)->get(['id', 'name']) : collect();
        $plans = $isClinical ? Plan::whereIn('insurance_id', $insurances->pluck('id'))->get(['id', 'name', 'insurance_id', 'code']) : collect();
        
        $products = \App\Models\Product::where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->get(['id', 'name', 'price', 'type', 'sku', 'is_exempt', 'manage_stock', 'stock'])
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'base_price_clp' => $p->price,
                    'price' => $p->price,
                    'is_exempt' => (bool)$p->is_exempt,
                    'sellable_type' => 'Product',
                    'type' => $p->type
                ];
            });

        $sessionTypes = $isClinical 
            ? SessionType::get(['id', 'name', 'base_price_clp'])->map(fn($s) => [...$s->toArray(), 'sellable_type' => 'SessionType', 'is_exempt' => true]) 
            : $products;

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

        $allClients = $patients->concat($corporateClients);

        $paymentMethods = [
            ['value' => 'pos_integrado', 'label' => '💳 POS Integrado (Transbank)'],
            ['value' => 'cash', 'label' => '💵 Efectivo'],
        ];

        $doctors = $isClinical ? Doctor::when($activeBranchId, function ($query) use ($activeBranchId) {
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->get() : collect();

        return Inertia::render('billing-checkout/index', [
            'patients' => $allClients,
            'sessionTypes' => $sessionTypes,
            'products' => $products,
            'agreements' => $isClinical ? Agreement::with('rules')->get() : collect(),
            'insurances' => $insurances,
            'plans' => $plans,
            'paymentMethods' => $paymentMethods,
            'doctors' => $doctors,
            'business_type' => $businessType,
        ]);
    }

    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();
        $paymentMethod = $data['payment_details']['payment_method'];

        // Limpieza de ID
        $rawPatientId = $request->input('patient_id');
        $numericPatientId = (int) str_replace(['person_', 'company_'], '', $rawPatientId);
        $data['patient_id'] = $numericPatientId;

        DB::beginTransaction();
        try {
            $payment = $this->paymentService->processPayment($data);

            if ($paymentMethod === 'pos_integrado') {
                $posResult = $this->posService->sendTransaction($payment->amount_clp, $payment->id);
                if (!$posResult['success']) {
                    throw new \Exception("POS rechazado: " . ($posResult['error'] ?? 'Error desconocido'));
                }
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'transaction_reference' => $posResult['authorization_code'],
                    'webpay_card_detail' => json_encode(['card_number' => $posResult['card_digits']]),
                ]);
            }

            $invoice = $this->invoiceService->processInvoice($payment, $data, true);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'uuid' => $payment->uuid,
                'url' => route('payments.success', ['uuid' => $payment->uuid]),
                'dte_folio' => $invoice->dte_folio
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error en POS Store: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
        }
    }

    public function success($uuid)
    {
        $payment = Payment::where('uuid', $uuid)
            ->with([
                'patient', 
                'branch', 
                'company',
                'paymentAllocations.treatmentSession.sessionType',
                'paymentAllocations.invoice.items',
                'receivables.insurance'
            ])
            ->firstOrFail();

        $invoice = Invoice::whereHas('paymentAllocations', fn($q) => $q->where('payment_id', $payment->id))
            ->with(['items'])
            ->latest()
            ->first();

        return inertia('billing-checkout/Success', [
            'payment' => $payment,
            'invoice' => $invoice,
            'is_dte_pending' => $invoice ? in_array($invoice->dte_status, [DteStatusEnum::PENDING, DteStatusEnum::GENERATED, DteStatusEnum::RETRY]) : false
        ]);
    }

    public function downloadReceiptPdf($uuid, $download = null)
    {
        $payment = Payment::where('uuid', $uuid)->with(['patient', 'company', 'branch'])->firstOrFail();
        $pdf = Pdf::loadView('pdf.payment_receipt', compact('payment'));
        return ($download === 'download') ? $pdf->download('recibo.pdf') : $pdf->stream('recibo.pdf');
    }

    public function getPatientStatus($id)
    {
        $numericId = (int) str_replace(['person_', 'company_'], '', $id);
        $patient = Patient::findOrFail($numericId);
        $debts = Invoice::where('patient_id', $numericId)->whereIn('payment_status', [FinanceStatusEnum::UNPAID, FinanceStatusEnum::PARTIAL])->get();
        return response()->json(['debts' => $debts, 'activePlans' => [], 'insurance' => null]);
    }
}
