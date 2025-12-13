<?php

namespace App\Services\Payments;

use Transbank\Webpay\WebpayPlus\Transaction;
use Transbank\Webpay\Options;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class WebpayPlusService
{
    protected string $commerceCode;
    protected string $apiKey;
    protected string $environment;

    public function __construct()
    {
        $this->commerceCode = config('webpay.commerce_code');
        $this->apiKey = config('webpay.api_key');
        $this->environment = config('webpay.environment', 'integration');
    }

    /**
     * Obtiene una instancia de Transaction configurada
     */
    protected function getTransaction(): Transaction
    {
        // SDK v5: Usar buildForIntegration() o buildForProduction()
        if ($this->environment === 'production') {
            return Transaction::buildForProduction($this->apiKey, $this->commerceCode);
        }
        
        return Transaction::buildForIntegration($this->apiKey, $this->commerceCode);
    }

    /**
     * Inicia una transacción Webpay Plus
     */
    public function create(string $buyOrder, string $sessionId, $amount_clp, ?string $returnUrl = null): array
    {
        try {
            $returnUrl = $returnUrl ?: config('webpay.return_url');

            // Normaliza order/session según límites de Transbank
            $buyOrder = Str::limit($buyOrder, 26, '');
            $sessionId = Str::limit($sessionId, 61, '');

            Log::info('Creando transacción Webpay', [
                'buy_order' => $buyOrder,
                'session_id' => $sessionId,
                'amount_clp' => $amount_clp,
                'return_url' => $returnUrl,
                'environment' => $this->environment,
            ]);

            $transaction = $this->getTransaction();
            $response = $transaction->create($buyOrder, $sessionId, (int) $amount_clp, $returnUrl);

            Log::info('Transacción Webpay creada exitosamente', [
                'token' => $response->getToken(),
                'url' => $response->getUrl(),
            ]);

            return [
                'token' => $response->getToken(),
                'url' => $response->getUrl(),
            ];
        } catch (\Exception $e) {
            Log::error('Error creando transacción Webpay', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Confirma (commit) una transacción
     */
    public function commit(string $token): array
    {
        try {
            Log::info('Confirmando transacción Webpay', ['token' => $token]);

            $transaction = $this->getTransaction();
            $resp = $transaction->commit($token);

            $result = [
                'status' => $resp->getStatus(),
                'amount_clp' => $resp->getAmount(),
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

            Log::info('Transacción Webpay confirmada', [
                'status' => $result['status'],
                'response_code' => $result['response_code'],
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Error confirmando transacción Webpay', [
                'token' => $token,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Consulta el estado de una transacción
     */
    public function status(string $token): array
    {
        try {
            $transaction = $this->getTransaction();
            $resp = $transaction->status($token);
            
            return [
                'status' => $resp->getStatus(),
                'amount_clp' => $resp->getAmount(),
                'buy_order' => $resp->getBuyOrder(),
                'session_id' => $resp->getSessionId(),
                'raw' => $resp,
            ];
        } catch (\Exception $e) {
            Log::error('Error consultando estado Webpay', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Reversa/Anula una transacción
     */
    public function refund(string $token, int $amount_clp): array
    {
        try {
            $transaction = $this->getTransaction();
            $resp = $transaction->refund($token, $amount_clp);
            
            return [
                'type' => method_exists($resp, 'getType') ? $resp->getType() : null,
                'balance' => method_exists($resp, 'getBalance') ? $resp->getBalance() : null,
                'authorization_date' => method_exists($resp, 'getAuthorizationDate') ? $resp->getAuthorizationDate() : null,
                'nullified_amount' => method_exists($resp, 'getNullifiedAmount') ? $resp->getNullifiedAmount() : null,
                'raw' => $resp,
            ];
        } catch (\Exception $e) {
            Log::error('Error en refund Webpay', [
                'token' => $token,
                'amount_clp' => $amount_clp,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}