<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Traits\NotificationUtils;

class OpenWAService
{
    use NotificationUtils;

    protected string $baseUrl;
    protected ?string $apiKey;
    protected string $sessionId;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.openwa.url', 'http://localhost:2785'), '/');
        $this->apiKey = config('services.openwa.key');
        $this->sessionId = config('services.openwa.session_id', 'main');
    }

    /**
     * Verificar si el servicio está activo
     */
    public function isConfigured(): bool
    {
        return !empty($this->baseUrl);
    }

    /**
     * Enviar mensaje de texto vía OpenWA
     */
    public function sendWhatsApp(string $to, string $message): bool
    {
        if (!$this->isConfigured()) {
            Log::warning('OpenWAService: Servicio no configurado');
            return false;
        }

        $cleanNumber = $this->formatWhatsAppNumber($to);

        if (!$cleanNumber) {
            Log::warning('OpenWAService: Número de teléfono inválido');
            return false;
        }

        // OpenWA usa el formato numero@c.us
        $chatId = $cleanNumber . '@c.us';

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/api/sessions/{$this->sessionId}/messages/send-text", [
                    'chatId' => $chatId,
                    'text' => $message,
                ]);

            if ($response->successful()) {
                Log::info('OpenWAService: Mensaje enviado exitosamente', [
                    'to' => $chatId,
                    'response' => $response->json()
                ]);
                return true;
            }

            Log::error('OpenWAService: Error en la respuesta de la API', [
                'status' => $response->status(),
                'body' => $response->body(),
                'to' => $chatId
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('OpenWAService: Excepción al enviar mensaje', [
                'error' => $e->getMessage(),
                'to' => $chatId
            ]);
            return false;
        }
    }

    /**
     * Obtener headers para las peticiones
     */
    protected function getHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        if ($this->apiKey) {
            $headers['X-API-Key'] = $this->apiKey;
        }

        return $headers;
    }
}
