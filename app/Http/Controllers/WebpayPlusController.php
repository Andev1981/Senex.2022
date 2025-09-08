<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Services\Payments\WebpayPlusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WebpayPlusController extends Controller
{
  public function __construct(private WebpayPlusService $webpay)
  {
    $this->middleware(['auth', 'verified']);
  }

  /**
   * POST /pagos/webpay/crear
   * Crea PaymentTransaction (si aplica) y redirige a Webpay.
   */
  public function create(Request $request)
  {
    $validated = $request->validate([
      'amount' => ['required', 'integer', 'min:1'],
      'buy_order' => ['nullable', 'string'],
      'meta' => ['sometimes', 'array'],
    ]);

    $buyOrder = $validated['buy_order'] ?? ('ORDER-' . now()->timestamp . '-' . auth()->id());
    $sessionId = 'user:' . auth()->id();

    $result = $this->webpay->create($buyOrder, $sessionId, $validated['amount']);

    // TODO: si usas PaymentTransaction, persiste aquí el token y estado "initiated"
    // PaymentTransaction::create([... 'gateway_token' => $result['token'], 'provider' => 'webpay_plus', ...]);

    return redirect()->away($result['url'] . '?token_ws=' . $result['token']);
  }

  /**
   * POST/GET /pagos/webpay/retorno
   * Maneja la vuelta desde TBK (ok/abort/timeout) y commit.
   */
  public function retorno(Request $request)
  {
    // Casos especiales cuando NO llega token_ws (abort/timeout)
    if (!$request->filled('token_ws')) {
      // TBK abort o timeout envía TBK_TOKEN / TBK_ID_SESION / TBK_ORDEN_COMPRA
      Log::warning('Webpay retorno sin token_ws', $request->all());
      // Actualiza PaymentTransaction a aborted/timeout según corresponda
      return Inertia::render('Payments/Result', [
        'ok' => false,
        'message' => 'Pago abortado o expirado',
      ]);
    }

    $token = $request->input('token_ws');
    $commit = $this->webpay->commit($token);

    // TODO: actualizar PaymentTransaction con $commit['status'] === 'AUTHORIZED'
    // y generar PaymentAllocation / consumo de plan si corresponde.

    $ok = ($commit['status'] ?? '') === 'AUTHORIZED' && ($commit['response_code'] ?? 1) === 0;

    return Inertia::render('Payments/Result', [
      'ok' => $ok,
      'commit' => $commit,
    ]);
  }

  /**
   * GET /pagos/webpay/estado?token=...
   */
  public function estado(Request $request)
  {
    $request->validate(['token' => 'required|string']);
    $status = $this->webpay->status($request->string('token'));
    return response()->json($status);
  }
}
