<?php

namespace App\Http\Controllers\Admin\Payments;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Patient;
use App\Services\Payments\PaymentService;
use App\Services\Payments\WebpayPlusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Controlador unificado para pagos con Webpay Plus
 * 
 * Este controlador maneja:
 * - Pagos de sesiones individuales
 * - Pagos de múltiples sesiones
 * - Pagos de deudas acumuladas
 * - Pagos de planes
 * - Retornos desde Transbank
 * - Consultas de estado
 */
class WebpayController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private WebpayPlusService $webpayService
    ) {
        // Las rutas de retorno y certificación deben ser públicas
        $this->middleware(['auth', 'verified'])->except([
            'return', 
            'publicReturn',
            'portalPagosIndex',
            'consultarDeudas',
            'checkoutView',
            'initiateProductPayment'
        ]);
    }

     /**
     * GET /pagar - Mostrar formulario de consulta RUT
     */
    public function portalPagosIndex()
    {
        return Inertia::render('paymentsPatients/PortalPago');
    }

    /**
     * POST /pagar - Consultar deudas y mostrar resultado
     */
    public function consultarDeudas(Request $request)
    {
        $request->validate([
            'rut' => ['required', 'string', 'max:12'],
        ]);

        $patient = Patient::where('rut', $request->rut)->first();

        if (!$patient) {
            return back()->withErrors([
                'rut' => 'No encontramos registros con este RUT.',
            ]);
        }

        // Obtener deudas activas (Facturas impagas)
        $deudas = Invoice::where('patient_id', $patient->id)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->where('amount_total_clp', '>', 0)
            ->orderBy('issue_date', 'asc')
            ->limit(100)
            ->with('items')
            ->get()
            ->map(function ($invoice) {
                // Calcular saldo pendiente
                $paid = $invoice->paymentAllocations()->sum('amount_clp');
                $balance = $invoice->amount_total_clp - $paid;

                if ($balance <= 0) return null;

                return [
                    'id' => $invoice->id,
                    'type' => 'invoice',
                    'description' => 'Documento #' . ($invoice->dte_folio ?? $invoice->id) . ' - ' . ($invoice->items->first()->description ?? 'Varios'),
                    'date' => $invoice->issue_date?->format('d M Y'),
                    'amount_clp' => (int) $balance, // Mostramos el saldo, no el total original
                ];
            })
            ->filter() // Quitar nulos
            ->values();

        Log::info('Portal Pago: Consulta de deudas', [
            'patient_id' => $patient->id,
            'deudas_count' => $deudas->count(),
            'ip' => $request->ip(),
        ]);

        // Guardar RUT en sesión para el pago
        session(['portal_rut' => $request->rut]);

        return Inertia::render('paymentsPatients/PortalPagoDeudas', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'first_name' => explode(' ', $patient->name)[0],
            ],
            'deudas' => $deudas,
            'total' => $deudas->sum('amount_clp'),
        ]);
    }

    // [NUEVA FUNCIÓN: LINK MÁGICO]
    /**
     * GET /pagar/auto/{rut} - Entrada via Link Mágico (Modo Automático)
     * Debe ser llamado desde una ruta con middleware('signed').
     */
    public function magicLink(Request $request, string $rut)
    {
        // El middleware 'signed' se encarga de validar la firma y la expiración.
        // Si el link es inválido, Laravel lanza un 403 y no llega aquí.
        
        // 1. Buscar al paciente por RUT (asumiendo que el RUT viene limpio de la URL)
        $patient = Patient::where('rut', $rut)->first();

        if (!$patient) {
            // Si no se encuentra, redirigimos al portal manual con error.
            return redirect()->route('portal.pago.index')
                ->with('error', 'El enlace de pago no es válido o el paciente no fue encontrado.');
        }

        // 2. Obtener deudas activas (Reutilizando la lógica de consultarDeudas)
        $deudas = Invoice::where('patient_id', $patient->id)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->where('amount_total_clp', '>', 0)
            ->orderBy('issue_date', 'asc')
            ->limit(100)
            ->with('items')
            ->get()
            ->map(function ($invoice) {
                // Calcular saldo pendiente
                $paid = $invoice->paymentAllocations()->sum('amount_clp');
                $balance = $invoice->amount_total_clp - $paid;

                if ($balance <= 0) return null;

                return [
                    'id' => $invoice->id,
                    'type' => 'invoice',
                    'description' => 'Documento #' . ($invoice->dte_folio ?? $invoice->id) . ' - ' . ($invoice->items->first()->description ?? 'Varios'),
                    'date' => $invoice->issue_date?->format('d M Y'),
                    'amount_clp' => (int) $balance,
                ];
            })
            ->filter()
            ->values();
            
        // 3. Guardar RUT en sesión (igual que en consultarDeudas) para el siguiente paso de pago
        session(['portal_rut' => $patient->rut]);


        // 4. Renderizar DIRECTO la vista de deudas con los datos precargados
        return Inertia::render('paymentsPatients/PortalPagoDeudas', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'first_name' => explode(' ', $patient->name)[0],
            ],
            'deudas' => $deudas,
            'total' => $deudas->sum('amount_clp'),
            'mode' => 'auto', // Indica al frontend que viene de un link mágico
        ]);
    }
    public function checkoutView()
    {
        return Inertia::render('products/ProductCheckout', [
            'products' => \App\Models\Product::where('is_active', true)->get(),
        ]);
    }

    /**
     * Inicia un pago de producto (Certificación)
     */
    public function initiateProductPayment(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        // Para certificación usamos un paciente por defecto sin filtrar por empresa (ya que es un portal público)
        $patient = Patient::withoutGlobalScopes()->first() 
                   ?? abort(404, 'Debe crear al menos un paciente en el sistema para realizar pruebas');
        
        $product = \App\Models\Product::findOrFail($validated['product_id']);
        $amount_clp = (int) ($product->price * $validated['quantity']);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $patient->id,
                'company_id' => $product->company_id,
                'branch_id'  => $product->branch_id,
                'user_id'    => $product->user_id,
                'amount_clp' => $amount_clp,
                'notes'      => "Certificación Transbank Pública: {$product->name} (x{$validated['quantity']})",
                'metadata'   => [
                    'type'       => 'product_certification',
                    'product_id' => $product->id,
                    'quantity'   => $validated['quantity'],
                    'unit_price' => $product->price
                ]
            ], route('public.webpay.return')); // Enviamos la URL pública de retorno

            Log::info('Webpay public product payment initiated', [
                'payment_id' => $result['payment_id'],
                'product_id' => $product->id,
                'patient_id' => $patient->id,
                'amount_clp' => $amount_clp,
            ]);

            // Redirigir usando una vista que haga el POST automático a Transbank
            return view('webpay.redirect', [
                'url' => $result['url'],
                'token' => $result['token']
            ]);

        } catch (\Exception $e) {
            Log::error('Error iniciando pago público de producto Webpay', [
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Inicia un pago individual para una sesión
     * POST /payments/webpay/session/{session}
     */
    public function initSessionPayment(Request $request, int $sessionId)
    {
        // DEBUG - Borrar después
        Log::info('=== INICIO DEBUG WEBPAY ===');
        Log::info('Request data:', $request->all());
        Log::info('Session ID:', ['session_id' => $sessionId]);
        Log::info('User:', ['user_id' => auth()->id()]);
        
        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'amount_clp' => ['required', 'integer', 'min:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);


        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $validated['patient_id'],
                'treatment_session_id' => $sessionId,
                'amount_clp' => $validated['amount_clp'],
                'notes' => $validated['notes'] ?? "Pago sesión #{$sessionId}",
            ]);

            // Guardar session_id en sesión para asignar después del pago
            session(['pending_payment_sessions' => [$sessionId]]);

            Log::info('Webpay session payment initiated: ', [
                'payment_id' => $result['payment_id'],
                'session_id' => $sessionId,
                'token' => $result['token'],
                'url' => $result['url'],
            ]);

            /* return view('webpay.redirect', [
                'url' => $result['url'],
                'token' => $result['token']
            ]); */
            return response()->json([
                'url' => $result['url'],
                'token' => $result['token']
            ]);


        } catch (\Exception $e) {
            Log::error('Error iniciando pago Webpay para sesión', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo iniciar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Inicia un pago para múltiples sesiones
     * POST /payments/webpay/sessions/multiple
     */
    public function initMultipleSessionsPayment(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'session_ids' => ['required', 'array', 'min:1'],
            'session_ids.*' => ['required', 'integer', 'exists:treatment_sessions,id'],
            'amount_clp' => ['required', 'integer', 'min:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $validated['patient_id'],
                'amount_clp' => $validated['amount_clp'],
                'notes' => $validated['notes'] ?? 'Pago de ' . count($validated['session_ids']) . ' sesiones',
            ]);

            // Guardar session_ids en sesión para asignar después del pago
            session(['pending_payment_sessions' => $validated['session_ids']]);

            Log::info('Webpay multiple sessions payment initiated', [
                'payment_id' => $result['payment_id'],
                'sessions_count' => count($validated['session_ids']),
                'token' => $result['token'],
            ]);

            return view('webpay.redirect', [
                'url' => $result['url'],
                'token' => $result['token']
            ]);

        } catch (\Exception $e) {
            Log::error('Error iniciando pago múltiple Webpay', [
                'session_ids' => $validated['session_ids'],
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo iniciar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Inicia un pago para facturas acumuladas
     * POST /payments/webpay/debts
     */
    public function initDebtsPayment(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'invoice_ids' => ['required', 'array', 'min:1'],
            'invoice_ids.*' => ['required', 'integer', 'exists:invoices,id'],
            'amount_clp' => ['required', 'integer', 'min:50'],
            'is_partial' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $validated['patient_id'],
                'amount_clp' => $validated['amount_clp'],
                'notes' => $validated['notes'] ?? 'Pago de facturas pendientes',
            ]);

            // Guardar invoice_ids en sesión para asignar después del pago
            session([
                'pending_payment_invoices' => $validated['invoice_ids'],
                'is_partial_payment' => $validated['is_partial'] ?? false,
            ]);

            Log::info('Webpay invoices payment initiated', [
                'payment_id' => $result['payment_id'],
                'invoices_count' => count($validated['invoice_ids']),
                'amount_clp' => $validated['amount_clp'],
                'token' => $result['token'],
            ]);

             return view('webpay.redirect', [
                'url' => $result['url'],
                'token' => $result['token']
            ]);

        } catch (\Exception $e) {
            Log::error('Error iniciando pago de facturas Webpay', [
                'invoice_ids' => $validated['invoice_ids'],
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo iniciar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Inicia un pago para un plan
     * POST /payments/webpay/plan/{plan}
     */
    public function initPlanPayment(Request $request, int $planId)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'amount_clp' => ['required', 'integer', 'min:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $validated['patient_id'],
                'amount_clp' => $validated['amount_clp'],
                'notes' => $validated['notes'] ?? "Compra plan #{$planId}",
            ]);

            // Guardar plan_id en sesión para asignar después del pago
            session(['pending_payment_plan' => $planId]);

            Log::info('Webpay plan payment initiated', [
                'payment_id' => $result['payment_id'],
                'plan_id' => $planId,
                'token' => $result['token'],
            ]);

             return view('webpay.redirect', [
                'url' => $result['url'],
                'token' => $result['token']
            ]);

        } catch (\Exception $e) {
            Log::error('Error iniciando pago de plan Webpay', [
                'plan_id' => $planId,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo iniciar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Retorno desde Webpay (autenticado - para usuarios logueados)
     * GET/POST /payments/webpay/return
     */
    public function return(Request $request)
    {
        // Casos de abort/timeout (Viene TBK_TOKEN o nada)
        if (!$request->filled('token_ws')) {
            $token = $request->input('TBK_TOKEN');
            $this->paymentService->logAbortedTransaction($token, $request->all());

            return Inertia::render('payments/WebpayResult', [
                'success' => false,
                'message' => 'El pago fue cancelado o expiró',
                'type' => 'cancelled',
            ]);
        }

        $token = $request->input('token_ws');

        try {
            // Confirmar transacción con Transbank
            $payment = $this->paymentService->confirmWebpayTransaction($token);

            $success = $payment->status === 'completed';

            // Si fue exitoso, asignar sesiones/deudas/planes pendientes
            if ($success) {
                $this->allocatePendingItems($payment);
            }

            Log::info('Webpay transaction confirmed', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'amount_clp' => $payment->amount_clp,
                'authorization_code' => $payment->webpay_authorization_code,
            ]);

            return Inertia::render('payments/WebpayResult', [
                'success' => $success,
                'payment' => [
                    'id' => $payment->id,
                    'amount_clp' => $payment->amount_clp,
                    'authorization_code' => $payment->webpay_authorization_code,
                    'payment_type' => $payment->payment_method,
                    'installments' => $payment->webpay_installments,
                    'card_detail' => $payment->webpay_card_detail,
                    'transaction_date' => $payment->webpay_transaction_date,
                    'patient_name' => $payment->patient->full_name ?? null,
                ],
                'message' => $success 
                    ? '¡Pago realizado exitosamente!' 
                    : 'El pago no pudo ser procesado',
                'type' => $success ? 'success' : 'failed',
            ]);

        } catch (\Exception $e) {
            Log::error('Error confirmando transacción Webpay', [
                'token' => $token,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('payments/WebpayResult', [
                'success' => false,
                'message' => 'Ocurrió un error al procesar el pago',
                'type' => 'error',
                'error' => app()->environment('local') ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * Retorno público desde Webpay (para payment links sin autenticación)
     * GET/POST /public/payments/webpay/return
     */
    public function publicReturn(Request $request)
    {
        if (!$request->filled('token_ws')) {
            $token = $request->input('TBK_TOKEN');
            $this->paymentService->logAbortedTransaction($token, $request->all());

            return Inertia::render('payments/Publicwebpayresult', [
                'success' => false,
                'message' => 'La transacción fue cancelada o el tiempo expiró',
            ]);
        }

        $token = $request->input('token_ws');

        try {
            $payment = $this->paymentService->confirmWebpayTransaction($token);
            $success = $payment->status === 'completed';

            // Cargar paciente para mostrar nombre en la vista
            $payment->load('patient');

            if ($success) {
                $this->allocatePendingItems($payment);
            }

            return Inertia::render('payments/Publicwebpayresult',[
                'success' => $success,
                'payment' => $payment,
                'message' => $success 
                    ? '¡Pago realizado exitosamente!'
                    : 'El pago fue rechazado por la entidad bancaria',
            ]);

        } catch (\Exception $e) {
            Log::error('Error en retorno público Webpay', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('payments/Publicwebpayresult', [
                'success' => false,
                'message' => 'Ocurrió un error inesperado al procesar la confirmación del pago',
            ]);
        }
    }

    /**
     * Consulta el estado de una transacción
     * GET /payments/webpay/{token}/status
     */
    public function status(string $token)
    {
        try {
            $status = $this->webpayService->status($token);

            return response()->json([
                'success' => true,
                'data' => $status,
            ]);

        } catch (\Exception $e) {
            Log::error('Error consultando estado Webpay', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'No se pudo consultar el estado',
            ], 400);
        }
    }

    /**
     * Asigna sesiones/deudas/planes pendientes al pago confirmado
     */
    private function allocatePendingItems($payment): void
    {
        // Asignar sesiones si existen
        if (session()->has('pending_payment_sessions')) {
            $sessionIds = session('pending_payment_sessions');
            try {
                $this->paymentService->allocateToSessions($payment, $sessionIds);
                Log::info('Sessions allocated to payment', [
                    'payment_id' => $payment->id,
                    'session_ids' => $sessionIds,
                ]);
            } catch (\Exception $e) {
                Log::error('Error allocating sessions to payment', [
                    'payment_id' => $payment->id,
                    'session_ids' => $sessionIds,
                    'error' => $e->getMessage(),
                ]);
            }
            session()->forget('pending_payment_sessions');
        }

        // Asignar facturas si existen
        if (session()->has('pending_payment_invoices')) {
            $invoiceIds = session('pending_payment_invoices');
            $isPartial = session('is_partial_payment', false);
            
            try {
                $this->paymentService->allocateToInvoices($payment, $invoiceIds, $isPartial);
                Log::info('Invoices allocated to payment', [
                    'payment_id' => $payment->id,
                    'invoice_ids' => $invoiceIds,
                    'is_partial' => $isPartial,
                ]);
            } catch (\Exception $e) {
                Log::error('Error allocating invoices to payment', [
                    'payment_id' => $payment->id,
                    'invoice_ids' => $invoiceIds,
                    'error' => $e->getMessage(),
                ]);
            }
            session()->forget(['pending_payment_invoices', 'is_partial_payment']);
        }

        // Asignar plan si existe
        if (session()->has('pending_payment_plan')) {
            $planId = session('pending_payment_plan');
            
            try {
                $this->paymentService->allocateToPlan($payment, $planId);
                Log::info('Plan allocated to payment', [
                    'payment_id' => $payment->id,
                    'plan_id' => $planId,
                ]);
            } catch (\Exception $e) {
                Log::error('Error allocating plan to payment', [
                    'payment_id' => $payment->id,
                    'plan_id' => $planId,
                    'error' => $e->getMessage(),
                ]);
            }
            session()->forget('pending_payment_plan');
        }

        // Lógica para productos (Certificación)
        if ($payment->metadata && ($payment->metadata['type'] ?? '') === 'product_certification') {
            $productId = $payment->metadata['product_id'];
            $qty = $payment->metadata['quantity'];
            
            try {
                $product = \App\Models\Product::find($productId);
                if ($product && $product->manage_stock) {
                    $product->decrement('stock', $qty);
                    Log::info('Stock decremented for product certification', [
                        'product_id' => $productId,
                        'qty' => $qty,
                        'new_stock' => $product->stock
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error processing stock for product certification', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}