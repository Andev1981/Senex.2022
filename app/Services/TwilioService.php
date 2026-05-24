<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;
use App\Traits\NotificationUtils;

class TwilioService
{
    use NotificationUtils;

    protected $client;
    protected $smsFrom;
    protected $whatsappFrom;

    public function __construct()
    {

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }

        $this->smsFrom = config('services.twilio.sms_from');
        $this->whatsappFrom = config('services.twilio.whatsapp_from');
    }

    /**
     * Verificar si Twilio está configurado
     */
    public function isConfigured(): bool
    {
        return $this->client !== null && ($this->smsFrom || $this->whatsappFrom);
    }

    /**
     * Enviar SMS
     */
    public function sendSms(string $to, string $message): bool
    {
        if (!$this->client || !$this->smsFrom) {
            Log::warning('TwilioService: SMS no configurado');
            return false;
        }

        $to = $this->formatWhatsAppNumber($to);

        if (!$to) {
            Log::warning('TwilioService: Número de teléfono inválido');
            return false;
        }

        try {
            $this->client->messages->create($to, [
                'from' => $this->smsFrom,
                'body' => $message,
            ]);

            Log::info('TwilioService: SMS enviado', [
                'to' => $to,
                'length' => strlen($message),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('TwilioService: Error enviando SMS', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Enviar WhatsApp
     */
    public function sendWhatsApp(string $to, string $message): bool
    {
        if (!$this->client || !$this->whatsappFrom) {
            Log::warning('TwilioService: WhatsApp no configurado');
            return false;
        }

        $cleanNumber = $this->formatWhatsAppNumber($to);

        if (!$cleanNumber) {
            Log::warning('TwilioService: Número de teléfono inválido para WhatsApp');
            return false;
        }

        try {
            $this->client->messages->create(
                'whatsapp:' . $cleanNumber,
                [
                    'from' => 'whatsapp:' . $this->whatsappFrom,
                    'body' => $message,
                ]
            );

            Log::info('TwilioService: WhatsApp enviado', [
                'to' => $cleanNumber,
                'length' => strlen($message),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('TwilioService: Error enviando WhatsApp', [
                'to' => $cleanNumber,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
