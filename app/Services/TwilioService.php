<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class TwilioService
{
    protected $client;
    protected $smsFrom;
    protected $whatsappFrom;

    public function __construct()
    {
        /* $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        
        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }
        
        $this->smsFrom = config('services.twilio.sms_from');
        $this->whatsappFrom = config('services.twilio.whatsapp_from'); */

        // Reemplaza config(...) con env(...)
        $sid = env('TWILIO_SID'); // <--- Leer directamente del .env
        $token = env('TWILIO_TOKEN'); // <--- Leer directamente del .env
        
        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }
        
        $this->smsFrom = env('TWILIO_SMS_FROM');
        $this->whatsappFrom = env('TWILIO_WHATSAPP_FROM');

         Log::error('TwilioService: ', [
                 'SID: ' => $sid,
                 'TOKEN: ' => $token,
                 'SMSFROM: ' => $this->smsFrom,
                 'WHATSAPPFROM: ' => $this->whatsappFrom,
             ]);

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

        $to = $this->formatPhoneNumber($to);
        
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

        $to = $this->formatPhoneNumber($to);
        
        if (!$to) {
            Log::warning('TwilioService: Número de teléfono inválido para WhatsApp');
            return false;
        }

        try {
            $this->client->messages->create(
                'whatsapp:' . $to,
                [
                    'from' => 'whatsapp:' . $this->whatsappFrom,
                    'body' => $message,
                ]
            );

            Log::info('TwilioService: WhatsApp enviado', [
                'to' => $to,
                'length' => strlen($message),
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('TwilioService: Error enviando WhatsApp', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Enviar recordatorio de pago por SMS
     */
    public function sendPaymentReminderSms(string $phone, string $patientName, int $amount_clp, string $portalUrl): bool
    {
        $message = "KineMobile: Hola {$patientName}, tienes pagos pendientes por " . 
                   $this->formatCLP($amount_clp) . ". Paga fácil en: {$portalUrl}";

        return $this->sendSms($phone, $message);
    }

    /**
     * Enviar recordatorio de pago por WhatsApp
     */
    public function sendPaymentReminderWhatsApp(string $phone, string $patientName, int $amount_clp, int $itemCount, string $portalUrl): bool
    {
        $message = "Hola {$patientName}! 👋\n\n" .
                   "Tienes {$itemCount} pago(s) pendiente(s) en KineMobile por un total de *" . 
                   $this->formatCLP($amount_clp) . "*.\n\n" .
                   "💳 Paga fácil con tu RUT en:\n{$portalUrl}\n\n" .
                   "¿Dudas? Responde a este mensaje.";

        return $this->sendWhatsApp($phone, $message);
    }

    /**
     * Formatear número de teléfono a E.164 (Chile)
     */
    private function formatPhoneNumber(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Limpiar caracteres no numéricos
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Si está vacío después de limpiar
        if (empty($phone)) {
            return null;
        }

        // Si ya tiene código de país Chile (56)
        if (str_starts_with($phone, '56')) {
            return '+' . $phone;
        }

        // Si empieza con 9 y tiene 9 dígitos (celular chileno)
        if (str_starts_with($phone, '9') && strlen($phone) === 9) {
            return '+56' . $phone;
        }

        // Si tiene 8 dígitos (celular sin el 9 inicial)
        if (strlen($phone) === 8) {
            return '+569' . $phone;
        }

        // Si empieza con 2 y tiene 9 dígitos (fijo Santiago)
        if (str_starts_with($phone, '2') && strlen($phone) === 9) {
            return '+56' . $phone;
        }

        return null;
    }

    /**
     * Formatear monto a CLP
     */
    private function formatCLP(int $amount_clp): string
    {
        return '$' . number_format($amount_clp, 0, ',', '.');
    }
}