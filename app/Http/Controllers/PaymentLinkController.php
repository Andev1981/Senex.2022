<?php

namespace App\Http\Controllers;

use App\Models\PaymentLink;
use App\Models\Patient;
use App\Notifications\PaymentLinkNotification;
use App\Services\Payments\WebpayPlusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentLinkController extends Controller
{
    public function __construct(
        private WebpayPlusService $webpayService
    ) {}

    // ============================================================================
    // RUTAS PÚBLICAS (sin autenticación)
    // ============================================================================

    /**
     * Mostrar página de pago (pública, sin auth)
     * GET /pay/{token}
     */

    

    public function show(string $token)
    {
        $paymentLink = PaymentLink::with('patient')
            ->where('token', $token)
            ->firstOrFail();

        // Incrementar contador de accesos
        $paymentLink->incrementAccessCount();

        // Verificar si ya está pagado
        if ($paymentLink->status === 'paid') {
            return Inertia::render('PaymentLink/AlreadyPaid', [
                'paymentLink' => [
                    'description' => $paymentLink->description,
                    'amount' => $paymentLink->amount,
                    'paid_at' => $paymentLink->paid_at,
                    'patient_name' => $paymentLink->patient->name . ' ' . $paymentLink->patient->last_name,
                ],
            ]);
        }

        // Verificar si expiró
        if ($paymentLink->is_expired) {
            return Inertia::render('PaymentLink/Expired', [
                'paymentLink' => [
                    'description' => $paymentLink->description,
                    'amount' => $paymentLink->amount,
                    'expires_at' => $paymentLink->expires_at,
                ],
            ]);
        }

        // Verificar límite de accesos
        if ($paymentLink->access_count > $paymentLink->max_access_count) {
            return Inertia::render('PaymentLink/AccessLimitExceeded', [
                'message' => 'Este link ha excedido el número máximo de accesos. Contacta al centro.',
            ]);
        }

        // Mostrar página de pago
        return Inertia::render('PaymentLink/Show', [
            'paymentLink' => [
                'token' => $paymentLink->token,
                'description' => $paymentLink->description,
                'amount' => $paymentLink->amount,
                'allow_partial_payment' => $paymentLink->allow_partial_payment,
                'minimum_amount' => $paymentLink->minimum_amount,
                'paid_amount' => $paymentLink->paid_amount,
                'remaining_amount' => $paymentLink->remaining_amount,
                'payment_progress' => $paymentLink->payment_progress,
                'patient_name' => $paymentLink->patient->name . ' ' . $paymentLink->patient->last_name,
                'expires_at' => $paymentLink->expires_at,
                'allowed_payment_methods' => $paymentLink->allowed_payment_methods,
            ],
        ]);
    }

    /**
     * Iniciar pago con Webpay desde payment link
     * POST /pay/{token}/checkout
     */
    public function checkout(Request $request, string $token)
    {
        $paymentLink = PaymentLink::where('token', $token)->firstOrFail();

        // Validar que sea pagable
        if (!$paymentLink->is_payable) {
            return response()->json([
                'error' => 'Este link de pago no está disponible'
            ], 400);
        }

        // Validar monto si es pago parcial
        if ($paymentLink->allow_partial_payment) {
            $request->validate([
                'amount' => [
                    'required',
                    'integer',
                    'min:' . $paymentLink->minimum_amount,
                    'max:' . $paymentLink->remaining_amount,
                ],
            ]);

            $amountToPay = $request->input('amount');
        } else {
            $amountToPay = $paymentLink->remaining_amount;
        }

        try {
            DB::beginTransaction();

            // Crear transacción Webpay
            $result = $this->webpayService->create(
                buyOrder: 'PAYLINK-' . $paymentLink->id . '-' . now()->timestamp,
                sessionId: 'session-' . uniqid(),
                amount: $amountToPay,
                returnUrl: route('payment-link.webpay-return')
            );

            // Guardar información en sesión
            session([
                'payment_link_id' => $paymentLink->id,
                'payment_link_token' => $paymentLink->token,
                'payment_link_amount' => $amountToPay,
                'webpay_token' => $result['token'],
                'webpay_buy_order' => 'PAYLINK-' . $paymentLink->id . '-' . now()->timestamp,
            ]);

            DB::commit();

            return response()->json([
                'url' => $result['url'],
                'token' => $result['token'],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error al iniciar pago desde payment link', [
                'payment_link_id' => $paymentLink->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Error al procesar el pago. Por favor intenta nuevamente.'
            ], 500);
        }
    }

    /**
     * Return URL de Webpay para payment links
     * POST /pay/webpay/return
     */
    public function webpayReturn(Request $request)
    {
        $token_ws = $request->input('token_ws');

        if (!$token_ws) {
            return redirect()->route('home')->with('error', 'Token de pago inválido');
        }

        try {
            // Commit de la transacción
            $result = $this->webpayService->commit($token_ws);

            if (!$result['success']) {
                return Inertia::render('PaymentLink/PaymentFailed', [
                    'message' => 'El pago fue rechazado. Por favor intenta nuevamente.',
                ]);
            }

            // Recuperar información de la sesión
            $paymentLinkId = session('payment_link_id');
            $paymentLinkAmount = session('payment_link_amount');

            if (!$paymentLinkId) {
                throw new \Exception('No se encontró información del payment link en sesión');
            }

            $paymentLink = PaymentLink::findOrFail($paymentLinkId);

            DB::beginTransaction();

            // Crear el registro de pago
            $payment = \App\Models\Payment::create([
                'patient_id' => $paymentLink->patient_id,
                'payment_date' => now(),
                'amount_clp' => $paymentLinkAmount,
                'payment_method' => $this->mapWebpayCardType($result['payment_type_code']),
                'status' => 'completed',
                
                // Datos de Webpay
                'webpay_buy_order' => $result['buy_order'],
                'webpay_session_id' => $result['session_id'] ?? null,
                'webpay_authorization_code' => $result['authorization_code'],
                'webpay_payment_type_code' => $result['payment_type_code'],
                'webpay_response_code' => $result['response_code'],
                'webpay_card_detail' => [
                    'card_number' => $result['card_number'] ?? null,
                ],
                'webpay_transaction_date' => $result['transaction_date'],
                'webpay_raw_response' => $result,
                
                'notes' => "Pago vía Payment Link: {$paymentLink->description}",
            ]);

            // Actualizar payment link
            if ($paymentLink->allow_partial_payment) {
                $paymentLink->recordPartialPayment($payment, $paymentLinkAmount);
            } else {
                $paymentLink->markAsPaid($payment);
            }

            DB::commit();

            // Limpiar sesión
            session()->forget([
                'payment_link_id',
                'payment_link_token',
                'payment_link_amount',
                'webpay_token',
                'webpay_buy_order',
            ]);

            return Inertia::render('PaymentLink/PaymentSuccess', [
                'payment' => [
                    'id' => $payment->id,
                    'amount' => $payment->amount_clp,
                    'authorization_code' => $payment->webpay_authorization_code,
                    'card_number' => $result['card_number'] ?? 'N/A',
                ],
                'paymentLink' => [
                    'description' => $paymentLink->description,
                    'status' => $paymentLink->status,
                    'remaining_amount' => $paymentLink->remaining_amount,
                ],
                'patientLoginUrl' => route('patient.login'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error al procesar return de Webpay para payment link', [
                'token_ws' => $token_ws,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('PaymentLink/PaymentFailed', [
                'message' => 'Ocurrió un error al procesar tu pago. Contacta al centro.',
            ]);
        }
    }

    // ============================================================================
    // RUTAS ADMIN (con autenticación)
    // ============================================================================

    /**
     * Listar payment links (admin)
     * GET /admin/payment-links
     */
    public function index(Request $request)
    {
        $query = PaymentLink::with(['patient', 'creator', 'payment'])
            ->orderBy('created_at', 'desc');

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('rut', 'like', "%{$search}%");
            });
        }

        $paymentLinks = $query->paginate(20);

        return Inertia::render('Payments/PaymentLinks', [
            'paymentLinks' => $paymentLinks,
            'filters' => $request->only(['status', 'patient_id', 'search']),
        ]);
    }

    /**
     * Crear payment link
     * POST /api/payment-links
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'description' => 'required|string|max:500',
            'amount' => 'required|integer|min:50',
            'allow_partial_payment' => 'boolean',
            'minimum_amount' => 'required_if:allow_partial_payment,true|nullable|integer|min:50',
            'expires_in_days' => 'nullable|integer|min:1|max:90',
            'session_ids' => 'nullable|array',
            'debt_ids' => 'nullable|array',
            'auto_issue_dte' => 'boolean',
            'dte_type' => 'nullable|integer|in:33,39',
            'notes' => 'nullable|string',
            'send_email' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $patient = Patient::findOrFail($validated['patient_id']);

            // Crear payment link
            $paymentLink = PaymentLink::create([
                'patient_id' => $validated['patient_id'],
                'created_by' => auth()->id(),
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'allow_partial_payment' => $validated['allow_partial_payment'] ?? false,
                'minimum_amount' => $validated['minimum_amount'] ?? null,
                'session_ids' => $validated['session_ids'] ?? null,
                'debt_ids' => $validated['debt_ids'] ?? null,
                'expires_at' => now()->addDays($validated['expires_in_days'] ?? 30),
                'auto_issue_dte' => $validated['auto_issue_dte'] ?? false,
                'dte_type' => $validated['dte_type'] ?? null,
                'recipient_email' => $patient->email,
                'notes' => $validated['notes'] ?? null,
                'metadata' => [
                    'created_from' => 'admin_panel',
                    'ip_address' => $request->ip(),
                ],
            ]);

            // Enviar email si se solicitó
            if ($validated['send_email'] ?? true) {
                if ($patient->email) {
                    $patient->notify(new PaymentLinkNotification($paymentLink));
                    $paymentLink->update([
                        'email_sent_at' => now(),
                        'email_sent_count' => 1,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment link creado exitosamente',
                'payment_link' => $paymentLink->load('patient'),
                'url' => $paymentLink->public_url,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error al crear payment link', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el payment link',
            ], 500);
        }
    }

    /**
     * Cancelar payment link
     * POST /admin/payment-links/{paymentLink}/cancel
     */
    public function cancel(PaymentLink $paymentLink)
    {
        if (!in_array($paymentLink->status, ['pending', 'partially_paid'])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden cancelar links pendientes',
            ], 400);
        }

        $paymentLink->cancel('Cancelado desde panel admin');

        return response()->json([
            'success' => true,
            'message' => 'Payment link cancelado',
        ]);
    }

    // ============================================================================
    // MÉTODOS PRIVADOS
    // ============================================================================

    /**
     * Mapear código de tipo de pago de Webpay a nuestra enumeración
     */
    private function mapWebpayCardType(string $paymentTypeCode): string
    {
        return match ($paymentTypeCode) {
            'VD' => 'webpay_debit',
            'VN' => 'webpay_credit',
            'VC' => 'webpay_credit',
            'SI' => 'webpay_credit',
            'S2' => 'webpay_credit',
            'NC' => 'webpay_credit',
            'VP' => 'webpay_prepaid',
            default => 'webpay_credit',
        };
    }
}