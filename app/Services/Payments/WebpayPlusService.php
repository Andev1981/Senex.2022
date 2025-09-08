<?php

namespace App\Services\Payments;

use Transbank\Webpay\WebpayPlus\Transaction;
use Transbank\Webpay\WebpayPlus\Options;
use Transbank\Webpay\Common\IntegrationType; // if needed by SDK v5
use Illuminate\Support\Str;

class WebpayPlusService
{
  protected string $commerceCode;
  protected string $apiKey;
  protected string $environment; // integration|production


  public function __construct()
  {
    $this->commerceCode = config('webpay.commerce_code');
    $this->apiKey = config('webpay.api_key');
    $this->environment = config('webpay.environment', 'integration');
  }


  protected function options(): Options
  {
    // SDK v5 usa Options para pasar credenciales y ambiente
    return new Options($this->commerceCode, $this->apiKey, $this->environment);
  }

  /**
   * Inicia una transacción Webpay Plus y retorna token y URL de redirección.
   *
   * @param string $buyOrder Identificador de orden (único)
   * @param string $sessionId Identificador de sesión (p.ej. user)
   * @param int|float $amount Monto en CLP
   * @param string|null $returnUrl URL a la que retornará el browser (override)
   * @return array{token:string,url:string}
   */
  public function create(string $buyOrder, string $sessionId, $amount, ?string $returnUrl = null): array
  {
    $trx = new Transaction($this->options());
    $returnUrl = $returnUrl ?: config('webpay.return_url');


    // Normaliza order/session
    $buyOrder = Str::limit($buyOrder, 26, ''); // límite TBK
    $sessionId = Str::limit($sessionId, 61, '');


    $response = $trx->create($buyOrder, $sessionId, (int) $amount, $returnUrl);
    // $response->getToken(); $response->getUrl();
    return [
      'token' => $response->getToken(),
      'url' => $response->getUrl(),
    ];
  }

  /**
   * Confirma (commit) una transacción con el token_ws recibido en la vuelta.
   * @param string $token
   * @return array Datos relevantes del commit
   */
  public function commit(string $token): array
  {
    $trx = new Transaction($this->options());
    $resp = $trx->commit($token);


    return [
      'status' => $resp->getStatus(), // e.g. AUTHORIZED, FAILED
      'amount' => $resp->getAmount(),
      'buy_order' => $resp->getBuyOrder(),
      'session_id' => $resp->getSessionId(),
      'authorization_code' => $resp->getAuthorizationCode(),
      'payment_type_code' => $resp->getPaymentTypeCode(),
      'response_code' => $resp->getResponseCode(),
      'installments_amount' => method_exists($resp, 'getInstallmentsAmount') ? $resp->getInstallmentsAmount() : null,
      'installments_number' => method_exists($resp, 'getInstallmentsNumber') ? $resp->getInstallmentsNumber() : null,
      'card_detail' => method_exists($resp, 'getCardDetail') ? $resp->getCardDetail() : null,
      'transaction_date' => method_exists($resp, 'getTransactionDate') ? $resp->getTransactionDate() : null,
      'raw' => $resp,
    ];
  }

  /**
   * Estado de una transacción por token.
   */
  public function status(string $token): array
  {
    $trx = new Transaction($this->options());
    $resp = $trx->status($token);
    return [
      'status' => $resp->getStatus(),
      'amount' => $resp->getAmount(),
      'buy_order' => $resp->getBuyOrder(),
      'session_id' => $resp->getSessionId(),
      'raw' => $resp,
    ];
  }

  /**
   * Reversa/Anula (si aplica y según políticas de TBK).
   */
  public function refund(string $token, int $amount): array
  {
    $trx = new Transaction($this->options());
    $resp = $trx->refund($token, $amount);
    return [
      'type' => $resp->getType(),
      'balance' => $resp->getBalance(),
      'authorization_date' => $resp->getAuthorizationDate(),
      'nullified_amount' => $resp->getNullifiedAmount(),
      'raw' => $resp,
    ];
  }
}
