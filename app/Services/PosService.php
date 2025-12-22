<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PosService
{
    protected $baseUrl;

    public function __construct()
    {
        // En integración local, suele ser la IP del PC de la caja
        $this->baseUrl = config('services.transbank.pos_endpoint', 'http://localhost:8001');
    }

    /**
     * Envía el monto al terminal físico
     */
    public function sendTransaction($amount, $ticketNumber)
    {
        // SIMULACIÓN: En lugar de Http::post, dormimos el proceso 2 segundos 
        // para simular que la máquina está procesando y luego aprobamos.
        sleep(2);

        return [
            'success' => true,
            'authorization_code' => 'SIM-' . rand(1000, 9999),
            'card_digits' => '4502',
            'raw' => ['status' => 'APPROVED_SIMULATED']
        ];
    }

    public function abortTransaction()
    {
        // SIMULACIÓN: Simplemente registramos en el log y devolvemos true
        Log::info("Simulación: Señal de aborto enviada al terminal.");

        return true;
    }

    /**
     * Envía el monto al terminal físico
     */
    public function sendTransactionMain($amount, $ticketNumber)
    {
        try {
            // Este es el "Handshake" con el terminal
            $response = Http::timeout(60)->post("{$this->baseUrl}/sale", [
                'amount' => (int) $amount,
                'ticket_number' => $ticketNumber,
                'collect_card_data' => true
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Transbank POS suele devolver 'responseCode' == 0 para éxito
                if ($data['responseCode'] === 0) {
                    return [
                        'success' => true,
                        'authorization_code' => $data['authorizationCode'],
                        'card_digits' => $data['last4Digits'] ?? '****',
                        'raw' => $data
                    ];
                }
            }

            return ['success' => false, 'error' => 'Transacción rechazada en terminal'];
        } catch (\Exception $e) {
            Log::error("Error de conexión con POS: " . $e->getMessage());
            return ['success' => false, 'error' => 'No se pudo conectar con el terminal físico'];
        }
    }

    public function abortTransactionMain()
    {
        try {
            // El Agente de Transbank suele tener un endpoint /abort o /cancel
            return Http::timeout(5)->post("{$this->baseUrl}/abort");
        } catch (\Exception $e) {
            Log::warning("No se pudo enviar señal de aborto al POS físico: " . $e->getMessage());
            return false;
        }
    }
}
