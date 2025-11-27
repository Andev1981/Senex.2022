<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;

class TwilioSmsChannel
{
    protected $client;
    protected $from;

    public function __construct()
    {
        $this->client = new Client(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
        $this->from = config('services.twilio.sms_from');
    }

    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        $message = $notification->toSms($notifiable);
        $to = $this->formatPhone($notifiable->phone);

        if (!$to) {
            return;
        }

        try {
            $this->client->messages->create($to, [
                'from' => $this->from,
                'body' => $message['body'],
            ]);

            // Log exitoso
            \Log::info('SMS enviado', [
                'to' => $to,
                'notification' => get_class($notification),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error enviando SMS', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Format phone number to E.164 (Chile)
     */
    private function formatPhone($phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Limpiar caracteres no numéricos
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Si empieza con 56, ya tiene código de país
        if (str_starts_with($phone, '56')) {
            return '+' . $phone;
        }

        // Si empieza con 9 y tiene 9 dígitos, agregar +56
        if (str_starts_with($phone, '9') && strlen($phone) === 9) {
            return '+56' . $phone;
        }

        // Si tiene 8 dígitos, agregar +569
        if (strlen($phone) === 8) {
            return '+569' . $phone;
        }

        return null;
    }
}