<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PosService
{
    protected $mode;
    protected $baseUrl;
    protected $commerceCode;
    protected $apiKey;
    protected $terminalId;

    public function __construct()
    {
        $this->mode = config('services.transbank.mode', 'local');
        $this->commerceCode = config('services.transbank.commerce_code');
        $this->apiKey = config('services.transbank.api_key');
        $this->terminalId = config('services.transbank.terminal_id');

        if ($this->mode === 'cloud') {
            $environment = config('services.transbank.environment', 'integration');
            $this->baseUrl = ($environment === 'production') 
                ? 'https://pos-integrado.transbank.cl/v1' 
                : 'https://pos-integrado-int.transbank.cl/v1';
        } else {
            // Modo Local (Agente en PC)
            $this->baseUrl = config('services.transbank.pos_endpoint', 'http://localhost:8081');
        }
    }

    /**
     * Envía el monto al terminal (Detección automática de modo)
     */
    public function sendTransaction($amount, $ticketNumber)
    {
        return ($this->mode === 'cloud') 
            ? $this->sendCloudTransaction($amount, $ticketNumber)
            : $this->sendLocalTransaction($amount, $ticketNumber);
    }

    /**
     * MODO LOCAL: Comunicación con Agente instalado en el PC
     */
    protected function sendLocalTransaction($amount, $ticketNumber)
    {
        try {
            Log::info("POS Local: Iniciando venta por $amount");

            $response = Http::timeout(65)->post("{$this->baseUrl}/sale", [
                'amount'            => (int) $amount,
                'ticket_number'     => (string) $ticketNumber,
                'collect_card_data' => true
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['responseCode']) && (int)$data['responseCode'] === 0) {
                    return [
                        'success' => true,
                        'authorization_code' => $data['authorizationCode'] ?? '000000',
                        'card_digits' => $data['last4Digits'] ?? '****',
                        'raw' => $data
                    ];
                }
                return ['success' => false, 'error' => $data['statusMessage'] ?? 'Venta rechazada en el terminal.'];
            }
            return ['success' => false, 'error' => 'No se pudo conectar con el Agente POS en localhost:8081.'];
        } catch (\Exception $e) {
            Log::error("Error POS Local: " . $e->getMessage());
            return ['success' => false, 'error' => 'Error de conexión local con la máquina POS.'];
        }
    }

    /**
     * MODO CLOUD: Comunicación directa con servidores Transbank
     */
    protected function sendCloudTransaction($amount, $ticketNumber)
    {
        try {
            Log::info("POS Cloud: Iniciando venta por $amount para terminal $this->terminalId");

            $response = Http::withHeaders([
                'Tbk-Api-Key-Id' => $this->commerceCode,
                'Tbk-Api-Key-Secret' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])
            ->timeout(70)
            ->post("{$this->baseUrl}/sales", [
                'amount' => (int) $amount,
                'ticketNumber' => (string) $ticketNumber,
                'terminalId' => $this->terminalId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['status']) && $data['status'] === 'APPROVED') {
                    return [
                        'success' => true,
                        'authorization_code' => $data['authorizationCode'] ?? '000000',
                        'card_digits' => $data['last4Digits'] ?? '****',
                        'raw' => $data
                    ];
                }
                return ['success' => false, 'error' => $data['description'] ?? 'Transacción Cloud rechazada.'];
            }
            $err = $response->json();
            return ['success' => false, 'error' => 'Error Cloud: ' . ($err['description'] ?? 'Fallo de comunicación.')];
        } catch (\Exception $e) {
            Log::error("Error POS Cloud: " . $e->getMessage());
            return ['success' => false, 'error' => 'No se pudo conectar con la red Cloud de Transbank.'];
        }
    }

    public function abortTransaction()
    {
        try {
            if ($this->mode === 'local') {
                Http::timeout(5)->post("{$this->baseUrl}/abort");
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
