<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Services\Payments\PaymentService;
use App\Services\Payments\WebpayPlusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WebpayController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private WebpayPlusService $webpayService
    ) {
        $this->middleware(['auth', 'verified'])->except(['return', 'publicReturn']);
    }

    /**
     * Inicia un pago individual para una sesión
     * POST /payments/webpay/session/{session}
     */
    public function initSessionPayment(Request $request, int $sessionId)
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => auth()->user()->patient_id ?? $request->input('patient_id'),
                'treatment_session_id' => $sessionId,
                'amount' => $validated['amount'],
                'notes' => $validated['notes'] ?? null,
            ]);

            Log::info('Webpay transaction initiated', [
                'payment_id' => $result['payment_id'],
                'token' => $result['token'],
            ]);

            return redirect()->away($result['url']);

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
            'amount' => ['required', 'integer', 'min:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $validated['patient_id'],
                'amount' => $validated['amount'],
                'notes' => $validated['notes'] ?? 'Pago de ' . count($validated['session_ids']) . ' sesiones',
            ]);

            // Guardar session_ids en sesión para asignar después del pago
            session(['pending_payment_sessions' => $validated['session_ids']]);

            Log::info('Webpay multiple sessions transaction initiated', [
                'payment_id' => $result['payment_id'],
                'sessions_count' => count($validated['session_ids']),
            ]);

            return redirect()->away($result['url']);

        } catch (\Exception $e) {
            Log::error('Error iniciando pago múltiple Webpay', [
                'session_ids' => $validated['session_ids'],
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo iniciar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Inicia un pago para deudas acumuladas
     * POST /payments/webpay/debts
     */
    public function initDebtsPayment(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'debt_ids' => ['required', 'array', 'min:1'],
            'debt_ids.*' => ['required', 'integer', 'exists:debts,id'],
            'amount' => ['required', 'integer', 'min:50'],
            'is_partial' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $result = $this->paymentService->initiateWebpayTransaction([
                'patient_id' => $validated['patient_id'],
                'amount' => $validated['amount'],
                'notes' => $validated['notes'] ?? 'Pago de deudas pendientes',
            ]);

            // Guardar debt_ids en sesión para asignar después del pago
            session(['pending_payment_debts' => $validated['debt_ids']]);

            Log::info('Webpay debts transaction initiated', [
                'payment_id' => $result['payment_id'],
                'debts_count' => count($validated['debt_ids']),
                'amount' => $validated['amount'],
            ]);

            return redirect()->away($result['url']);

        } catch (\Exception $e) {
            Log::error('Error iniciando pago de deudas Webpay', [
                'debt_ids' => $validated['debt_ids'],
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo iniciar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Retorno desde Webpay (autenticado)
     * GET/POST /payments/webpay/return
     */
    public function return(Request $request)
    {
        // Casos de abort/timeout (sin token_ws)
        if (!$request->filled('token_ws')) {
            Log::warning('Webpay return sin token_ws (abort/timeout)', $request->all());

            return Inertia::render('Payments/WebpayResult', [
                'success' => false,
                'message' => 'El pago fue cancelado o expiró',
                'type' => 'cancelled',
            ]);
        }

        $token = $request->input('token_ws');

        try {
            // Confirmar transacción
            $payment = $this->paymentService->confirmWebpayTransaction($token);

            $success = $payment->status === 'completed';

            // Si fue exitoso y hay sesiones/deudas pendientes, asignarlas
            if ($success) {
                $this->allocatePendingItems($payment);
            }

            Log::info('Webpay transaction confirmed', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'amount' => $payment->amount_clp,
            ]);

            return Inertia::render('Payments/WebpayResult', [
                'success' => $success,
                'payment' => [
                    'id' => $payment->id,
                    'amount' => $payment->amount_clp,
                    'authorization_code' => $payment->webpay_authorization_code,
                    'payment_type' => $payment->payment_method,
                    'installments' => $payment->webpay_installments,
                    'card_detail' => $payment->webpay_card_detail,
                    'transaction_date' => $payment->webpay_transaction_date,
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

            return Inertia::render('Payments/WebpayResult', [
                'success' => false,
                'message' => 'Ocurrió un error al procesar el pago',
                'type' => 'error',
                'error' => app()->environment('local') ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * Retorno público desde Webpay (para payment links)
     * GET/POST /public/payments/webpay/return
     */
    public function publicReturn(Request $request)
    {
        if (!$request->filled('token_ws')) {
            return view('payments.public-result', [
                'success' => false,
                'message' => 'El pago fue cancelado o expiró',
            ]);
        }

        $token = $request->input('token_ws');

        try {
            $payment = $this->paymentService->confirmWebpayTransaction($token);
            $success = $payment->status === 'completed';

            // Actualizar payment link si existe
            if ($success && session()->has('payment_link_id')) {
                $this->updatePaymentLink(session('payment_link_id'), $payment);
            }

            return view('payments.public-result', [
                'success' => $success,
                'payment' => $payment,
                'message' => $success 
                    ? '¡Pago realizado exitosamente!' 
                    : 'El pago no pudo ser procesado',
            ]);

        } catch (\Exception $e) {
            Log::error('Error en retorno público Webpay', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return view('payments.public-result', [
                'success' => false,
                'message' => 'Ocurrió un error al procesar el pago',
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
     * Asigna sesiones/deudas pendientes al pago confirmado
     */
    private function allocatePendingItems($payment): void
    {
        // Asignar sesiones si existen
        if (session()->has('pending_payment_sessions')) {
            $sessionIds = session('pending_payment_sessions');
            $this->paymentService->allocateToSessions($payment, $sessionIds);
            session()->forget('pending_payment_sessions');
        }

        // Asignar deudas si existen
        if (session()->has('pending_payment_debts')) {
            $debtIds = session('pending_payment_debts');
            $this->paymentService->allocateToDebts($payment, $debtIds);
            session()->forget('pending_payment_debts');
        }
    }

    /**
     * Actualiza el payment link después del pago
     */
    private function updatePaymentLink(int $linkId, $payment): void
    {
        try {
            $link = \App\Models\PaymentLink::findOrFail($linkId);
            $link->markAsPaid($payment->id, $payment->amount_clp);
            session()->forget('payment_link_id');
        } catch (\Exception $e) {
            Log::error('Error actualizando payment link', [
                'link_id' => $linkId,
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
