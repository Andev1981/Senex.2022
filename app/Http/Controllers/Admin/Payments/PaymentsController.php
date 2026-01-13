<?php

namespace App\Http\Controllers\Admin\Payments;

use App\Enums\PaymentMethodEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentNowRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Jobs\Dte\EmitDteJob;
use App\Models\Agreement;
use App\Models\Debt;
use App\Models\Doctor;
use App\Models\Insurance;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\PatientPlan;
use App\Models\Payment;
use App\Models\PaymentAllocation;
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

    /**
     * Inyectar el service en el constructor
     */
    public function __construct(
        private PaymentService $paymentService,
        private InvoiceService $invoiceService,
        private WebpayPlusService $webpayService,
        private PosService $posService
    ) {}

    public function index()
    {
        /*  $currentCompanyId = auth()->user()->company_id; */
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');

        // 1. Catálogos Base (necesarios para los dropdowns del formulario)

        $insurances = Insurance::where('company_id', $currentCompanyId)->get(['id', 'name']);

        // Para el filtro de planes en el front, enviamos todos los planes de esas aseguradoras
        $plans = Plan::whereIn('insurance_id', $insurances->pluck('id'))
            ->get(['id', 'name', 'insurance_id', 'code']);

        $sessionTypes = SessionType::get(['id', 'name', 'base_price_clp']);

        // Asumimos que la lista de pacientes es grande, por lo que quizás solo enviamos una pequeña lista inicial
        $patients = Patient::when($activeBranchId, function ($query) use ($activeBranchId) {
            // 🎯 Ahora simplemente preguntamos: 
            // "¿Está este paciente vinculado a esta sucursal en la tabla pivot?"
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->get(['id', 'name', 'last_name', 'rut', 'phone', 'email']);

        // Para el filtro de planes del usuario en el front, enviamos todos los planes de esas aseguradoras
        $patientPackages = PatientPlan::where('branch_id', $activeBranchId)->whereIn('patient_id', $patients->pluck('id'))
            ->get();

        // 2. Métodos de Pago (desde el Enum)
        $paymentMethods = collect(PaymentMethodEnum::cases())->map(function ($method) {
            return [
                'value' => $method->value,
                'label' => $method->label(),
            ];
        })->toArray();

        $doctors = Doctor::when($activeBranchId, function ($query) use ($activeBranchId) {
            // 🎯 Ahora simplemente preguntamos: 
            // "¿Está este paciente vinculado a esta sucursal en la tabla pivot?"
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->get();

        return Inertia::render('billingCheckout/Index', [
            'patients' => $patients,
            'sessionTypes' => $sessionTypes,
            'agreements' => Agreement::with('rules')->get(),
            'insurances' => $insurances,
            'plans' => $plans,
            'paymentMethods' => $paymentMethods,
            'patientPackages' => $patientPackages,
            'doctors' => $doctors,

            // Datos de contexto para el formulario
            'currentCompanyId' => $currentCompanyId,
            'currentBranchId' => auth()->user()->branch_id ?? null,
        ]);
    }

    public function processPayment(StorePaymentRequest $request)
    {
        $data = $request->validated();

        // 1. ACTUALIZAR PLAN DEL PACIENTE (Si coverage_details viene en la solicitud)
        if (!empty($data['coverage_details'])) {
            $this->updatePatientInsurance($data['patient_id'], $data['coverage_details']);
        }

        try {
            // 2. Llamar al servicio de facturación y cobertura
            $result = $this->paymentService->processBillingAndPayment(
                $request->patient_id,
                $request->services,
                $request->user()->company_id, // Aseguramos el contexto multi-empresa
                $request->user()->branch_id // Aseguramos el contexto de sucursal
            );

            // 3. Manejar la respuesta
            if ($result['status'] === 'success') {
                return response()->json([
                    'message' => 'Cobro y cobertura calculados. Copago: ' . number_format($result['patient_share_clp'], 0, ',', '.'),
                    'patient_share_clp' => $result['patient_share_clp']
                ], 200);
            }
        } catch (\Exception $e) {
            // 4. Manejar errores del servicio (ej. 'No hay convenio activo')
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Función auxiliar para actualizar o crear el Plan Activo del Paciente.
     */
    private function updatePatientInsurance(int $patientId, array $details): void
    {
        // 1. Desactivar planes anteriores
        \App\Models\PatientInsurance::where('patient_id', $patientId)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // 2. Crear/Actualizar el nuevo plan activo
        \App\Models\PatientInsurance::updateOrCreate(
            [
                'patient_id' => $patientId,
                'insurance_id' => $details['insurance_id'],
                'plan_id' => $details['plan_id']
            ],
            array_merge($details, [
                'is_active' => true,
                'enrollment_date' => now()->toDateString()
            ])
        );
    }


    public function storeWebpayOnly(StorePaymentRequest $request)
    {
        $data = $request->validated();

        DB::beginTransaction();
        try {
            // 1. PROCESAR EL PAGO, SESIONES Y DEUDAS
            // Este Service ya maneja la creación de todo en estado 'pending'
            $payment = $this->paymentService->processPayment($data);

            // 2. Determinar flujo según método de pago
            if ($data['payment_details']['payment_method'] === 'webpay') {

                // Generamos la transacción de Webpay
                $returnUrl = route('payments.webpay.confirm');

                // Usamos amount_clp porque el PaymentService ya lo mapeó ahí
                $webpayResponse = $this->webpayService->createTransaction(
                    $payment->uuid,
                    session()->getId(),
                    $payment->amount_clp,
                    $returnUrl
                );

                // Guardamos el token en el pago para el commit posterior
                $payment->update(['webpay_token' => $webpayResponse['token']]);

                DB::commit();

                return response()->json([
                    'uuid'   => $payment->uuid,
                    'url' => $webpayResponse['url'] . '?token_ws=' . $webpayResponse['token'],
                    'status' => 'pending_payment'
                ]);
            }

            if ($data['payment_details']['payment_method'] === 'pos_integrado') {


                // Llamamos al servicio (esto puede tardar unos segundos mientras el cliente paga)
                $posResult = $this->posService->sendTransaction(
                    $payment->amount_clp,
                    $payment->id
                );

                if (!$posResult['success']) {
                    // Si la máquina rechaza, lanzamos excepción para hacer Rollback del pago creado
                    throw new \Exception($posResult['error']);
                }

                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'transaction_reference' => $posResult['authorization_code'],
                    'webpay_card_detail' => json_encode(['card_number' => $posResult['card_digits']]),
                    'metadata' => array_merge($payment->metadata, ['pos_raw' => $posResult['raw']])
                ]);
            } else {
                // El dinero ya está en mano, completamos el pago
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now()
                ]);
            }

            // 3. PROCESAR BOLETA (Para POS y Manuales)
            // Lo metemos en un try-catch interno para que si falla la boleta, NO se borre el pago
            try {
                $invoice = $this->invoiceService->processInvoice($payment, $data);
                EmitDteJob::dispatch($invoice->id);
            } catch (\Exception $eInvoice) {
                Log::error("Pago #{$payment->id} OK, pero falló boleta: " . $eInvoice->getMessage());
                // 2. Retornamos éxito del pago pero con una ADVERTENCIA
                return response()->json([
                    'status' => 'partial_success',
                    'uuid' => $payment->uuid,
                    'warning' => 'El pago fue procesado, pero la boleta no pudo generarse automáticamente. Por favor, genérela manualmente desde el historial.'
                ]);
            }

            DB::commit(); // Finalizamos la transacción de base de datos

            // 4. RESPUESTA UNIFICADA PARA AXIOS
            if ($data['payment_details']['payment_method'] === 'pos_integrado' || $data['payment_details']['payment_method'] === 'webpay') {
                return response()->json([
                    'uuid'   => $payment->uuid,
                    'status' => 'success',
                    'url'    => route('payments.success', ['uuid' => $payment->uuid])
                ]);
            }

            return redirect()->route('payments.success', ['uuid' => $payment->uuid]);
        } catch (\Exception $ePayment) {
            DB::rollBack();
            Log::critical("Error fatal al procesar pago: " . $ePayment->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo registrar el pago: ' . $ePayment->getMessage()
            ], 422);
        }
    }

    /* Creador principal de Dte 41 */
    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();
        $paymentMethod = $data['payment_details']['payment_method'];

        // --- FASE 1: PROCESAR Y ASEGURAR EL PAGO ---
        DB::beginTransaction();
        try {
            // 1. Procesar lógica base del pago
            $payment = $this->paymentService->processPayment($data);

            // 2. Cobro según método
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
                    'metadata' => array_merge($payment->metadata ?? [], ['pos_raw' => $posResult['raw']])
                ]);
            } else {
                // Efectivo, Transferencia
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now()
                ]);
            }

            // 3. COMMIT CRÍTICO: El dinero ya está seguro.
            DB::commit();
        } catch (\Exception $ePayment) {
            DB::rollBack();
            Log::critical("Error fatal al procesar pago: " . $ePayment->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => $ePayment->getMessage()
            ], 422);
        }

        // --- FASE 2: EMISIÓN DE BOLETA (Delegada al Servicio Híbrido) ---

        // Llamamos al servicio. Él intentará emitir síncronamente.
        // Si falla el SII, él mismo capturará el error, despachará el Job y te devolverá la Invoice en estado 'PENDING_RETRY'.
        // Por lo tanto, aquí NO hace falta try/catch.
        $invoice = $this->invoiceService->processInvoice($payment, $data);

        // --- FASE 3: RESPUESTA AL FRONTEND ---

        // Verificamos el estado para decirle a la UI si mostrar "Éxito" o "En Proceso"
        // Asumimos que si está en 'CREATED' o 'PENDING_RETRY', es que no se completó síncronamente.
        $isDtePending = !in_array($invoice->dte_status, ['ENVIADO', 'ACEPTADO', 'PAID']); // Ajusta según tus constantes reales

        $warningMessage = $isDtePending
            ? "El documento se está generando en segundo plano (SII lento). Llegará al correo en breve."
            : null;

        return response()->json([
            'status' => 'success',
            'uuid' => $payment->uuid,
            'url' => route('payments.success', ['uuid' => $payment->uuid]),

            // Flags para Success.jsx
            'is_dte_pending' => $isDtePending,
            'dte_folio' => $invoice->dte_folio, // Puede ser null si quedó pendiente
            'warning_message' => $warningMessage
        ]);
    }

    public function commit(Request $request)
    {
        $token = $request->input('token_ws');

        if (!$token) {
            // El usuario abortó el pago en el formulario de Transbank
            return redirect()->route('payments.index')->with('error', 'El pago fue cancelado por el usuario.');
        }

        try {
            // 1. Buscar nuestro registro de pago ANTES de confirmar con Transbank
            // Esto evita consumir el token si el registro no existe en nuestra DB
            $payment = Payment::where('webpay_token', $token)->firstOrFail();

            // 2. Confirmar con Transbank (Consumo del Token)
            $result = $this->webpayService->commit($token);

            // 3. Evaluar respuesta del Banco
            if ($result['response_code'] === 0) {

                DB::beginTransaction();
                try {
                    // Actualizar el pago con datos de auditoría
                    $payment->update([
                        'status' => 'completed',
                        'transaction_reference' => $result['authorization_code'],
                        'webpay_response_code' => $result['response_code'],
                        'webpay_payment_type_code' => $result['payment_type_code'],
                        'webpay_card_detail' => json_encode($result['card_detail']),
                        'paid_at' => now(),
                    ]);

                    // 4. GENERAR DOCUMENTO TRIBUTARIO (DTE)
                    // Usamos el 'metadata' que congelamos en el Store
                    $invoice = $this->invoiceService->processInvoice($payment, $payment->metadata);

                    DB::commit();

                    // 5. Despachar el Job del SII (Fuera de la transacción de DB)
                    EmitDteJob::dispatch($invoice->id);

                    return redirect()->route('payments.success', ['uuid' => $payment->uuid]);
                } catch (\Exception $eInternal) {
                    DB::rollBack();
                    Log::error("Webpay aprobado pero falló lógica interna: " . $eInternal->getMessage());

                    // IMPORTANTE: El pago fue cobrado, pero falló la boleta/sesiones.
                    // No podemos decirle al usuario "falló el pago".
                    return redirect()->route('payments.success', ['uuid' => $payment->uuid])
                        ->with('warning', 'Pago aprobado, pero hubo un problema al generar tu boleta. Contacta a soporte.');
                }
            } else {
                // El pago fue rechazado por el banco (Ej: sin saldo)
                $payment->update(['status' => 'failed']);

                return redirect()->route('payments.index')->with([
                    'message' => 'El pago fue rechazado por la entidad bancaria.',
                    'type' => 'error'
                ]);
            }
        } catch (\Exception $e) {
            Log::critical("Error fatal en commit de Webpay: " . $e->getMessage());
            return redirect()->route('payments.index')->with([
                'message' => 'Error técnico al confirmar el pago. Verifique el estado en su banco.',
                'type' => 'error'
            ]);
        }
    }

    /**
     * Muestra el resumen del pago exitoso
     * * @param string $uuid
     */
    public function success($uuid)
    {
        // Buscamos el pago por UUID cargando todas las relaciones necesarias
        $payment = Payment::where('uuid', $uuid)
            ->with([
                'patient:id,name,last_name,rut,email', // Solo campos necesarios
                'paymentAllocation.treatmentSession.sessionType', // Para ver qué sesiones se pagaron
                'receivables.insurance', // Para ver qué seguros quedaron con deuda pendiente
                'branch' // Contexto de la sucursal
            ])
            ->firstOrFail();

        // Buscamos la boleta/factura asociada a este pago
        // Usamos el ID interno para mayor rapidez
        $invoice = Invoice::where('payment_id', $payment->id)
            ->with(['items'])
            ->first();

        // Retornamos a la vista de React mediante Inertia
        return inertia('BillingCheckout/Success', [
            'payment' => $payment,
            'invoice' => $invoice,
            // Pasamos una bandera si el DTE aún está en proceso de firma
            'is_dte_pending' => $invoice ? in_array($invoice->dte_status, [Invoice::SII_STATUS_PENDING, 'CREATED', 'PENDING_RETRY', Invoice::SII_STATUS_SENT]) : false
        ]);
    }



    public function abortPos(Request $request)
    {
        // Validamos que venga el UUID
        $request->validate(['uuid' => 'required|uuid|exists:payments,uuid']);

        try {
            // 1. Buscamos el pago específico por UUID
            $payment = Payment::where('uuid', $request->uuid)
                ->where('status', 'pending')
                ->first();

            if ($payment) {
                // 2. Notificamos al servicio POS para que envíe señal de cancelación al terminal
                // Esto es vital para que la maquinita deje de pedir la tarjeta
                $this->posService->abortTransaction();

                // 3. Actualizamos el estado para que no quede "en el aire"
                $payment->update([
                    'status' => 'void', // Anulado
                    'metadata' => array_merge($payment->metadata ?? [], [
                        'aborted_at' => now(),
                        'reason' => 'Cancelado manualmente por el cajero'
                    ])
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Transacción abortada correctamente.'
            ]);
        } catch (\Exception $e) {
            Log::error("Error al abortar POS: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo abortar la transacción en el terminal.'
            ], 500);
        }
    }

    public function downloadReceiptPdf($uuid, $download = null)
    {
        $payment = Payment::where('uuid', $uuid)
            ->with([
                'patient',
                'company',
                'branch',
                'paymentAllocation.treatmentSession.sessionType',
                'receivables.insurance'
            ])
            ->firstOrFail();

        // 🎯 Usamos la Policy para asegurar que solo personas autorizadas bajen el PDF
        if (auth()->user()->company_id !== $payment->company_id && !auth()->user()->isSuperAdmin()) {
            abort(403);
        }

        $pdf = Pdf::loadView('pdf.payment_receipt', compact('payment'));
        
        $filename = 'Comprobante_Pago_' . strtoupper(substr($payment->uuid, 0, 8)) . '.pdf';
        
        if ($download === 'download') {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }

    // Enviamos mediante el paciente la información de sus sesiones y pagos pendientes
    public function getPatientStatus($id)
    {
        $patient = Patient::with(['insurances' => function($q) {
            $q->wherePivot('is_active', true);
        }])->findOrFail($id);

        // 1. Buscamos deudas activas relacionadas con sesiones
        $debts = Debt::where('patient_id', $id)
            ->where('status', 'pending') // o 'partial'
            ->with(['treatmentSession.sessionType'])
            ->get();

        // 2. Buscamos si tiene planes activos (sesiones compradas no usadas)
        // Esto asume que tienes una tabla de saldos o la calculas
        $activePlans = PatientPlan::where('patient_id', $id)
            ->where('status', 'active')
            ->whereColumn('sessions_used', '<', 'sessions_included')
            ->with('plan') // Para saber qué session_type_id cubre este plan
            ->get()
            ->map(function ($pp) {
                return [
                    'id' => $pp->id,
                    'plan_name' => $pp->plan->name,
                    'session_type_id' => $pp->plan->session_type_id ?? null, // El ID que debe coincidir en el POS
                    'available' => $pp->sessions_included - $pp->sessions_used,
                ];
            });

        return response()->json([
            'debts' => $debts,
            'activePlans' => $activePlans,
            'insurance' => $patient->insurances->first() ? [
                'id' => $patient->insurances->first()->id,
                'plan_id' => $patient->insurances->first()->pivot->plan_id,
            ] : null
        ]);
    }


    public function chargeNowForSession(StorePaymentRequest $req, PaymentService $svc, TreatmentSession $session)
    {
        /* $this->authorize('update', $session);
    $payment = $svc->chargeNowForSession($session, $req->input('method'));

    return back()->with('ok', "Pago registrado (#{$payment->id})"); */
    }

    public function createWebpay(Request $req, PaymentService $svc, TreatmentSession $session)
    {
        $this->authorize('update', $session);
        /* $result = $svc->createWebpayTransaction(
      $session->patient_id,
      (float)$session->patient_amount_clp,
      ['treatment_session_id' => $session->id]
    ); */

        // redirige a pasarela
        /*  return redirect()->away($result['redirect']); */
    }

    // returnUrl/finish de WebPay
    public function confirmWebpay(Request $req, PaymentService $svc)
    {
        /* $token = $req->get('token_ws') ?? $req->get('TBK_TOKEN');
    $payment = $svc->confirmWebpayTransaction((string)$token);

    return redirect()->route('payments.show', $payment)
      ->with($payment->status === 'completed' ? 'ok' : 'error', 'Pago ' . $payment->status); */
    }

    public function allocateToInvoice(Request $req, PaymentService $svc, Invoice $invoice)
    {
        /* $this->authorize('update', $invoice);
    $paymentId = $req->input('payment_id');
    $amount_clp    = $req->input('amount_clp');

    $payment = \App\Models\Payment::findOrFail($paymentId);
    $svc->allocateToInvoice($payment, $invoice, $amount_clp ? (float)$amount_clp : null);

    return back()->with('ok', 'Pago asignado a factura.'); */
    }

    public function settleDebt(Request $req, PaymentService $svc, Debt $debt)
    {
        /* $this->authorize('update', $debt);
    $paymentId = $req->input('payment_id');
    $amount_clp    = $req->input('amount_clp');

    $payment = \App\Models\Payment::findOrFail($paymentId);
    $svc->settleDebtWithPayment($debt, $payment, $amount_clp ? (float)$amount_clp : null);

    return back()->with('ok', 'Deuda actualizada.'); */
    }
}
