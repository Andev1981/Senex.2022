<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use App\Services\TwilioService;

class TwilioWhatsAppChannel
{
   

    public function __construct(protected TwilioService $twilioService)
    {
        
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
        // 1. Obtener el mensaje de la notificación (Ahora con el nombre corregido)
        // Usamos el nombre del método original para acceder al array de mensaje.

        // [CORRECCIÓN 2] Llamar al método con el nombre correcto
        // toTwilioWhatsAppChannel es la convención que Laravel espera.
        if (!method_exists($notification, 'toTwilioWhatsAppChannel')) {
             Log::error('Notification does not have the required toTwilioWhatsAppChannel method.', [
                 'notification_class' => get_class($notification)
             ]);
             return;
        }

        $messageData = $notification->toTwilioWhatsAppChannel($notifiable);
        $body = $messageData['body'];

        $toPhone = $notifiable->phone; // Pasamos el teléfono tal cual. El Service lo formatea.


        // 2. Usar el TwilioService central para enviar
        if (!$this->twilioService->isConfigured()) {
            Log::warning('Twilio WhatsApp no configurado, saltando envío.');
            return;
        }

        $success = $this->twilioService->sendWhatsApp($toPhone, $body);

        if (!$success) {
             Log::error('Fallo el envío de WhatsApp', [
                 'patient_id' => $notifiable->id,
                 'phone' => $toPhone,
             ]);
        }
    }

    /**
     * Format phone number for WhatsApp (whatsapp:+56...)
     */
    /* private function formatWhatsAppNumber($phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Limpiar caracteres no numéricos
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Si empieza con 56, ya tiene código de país
        if (str_starts_with($phone, '56')) {
            return 'whatsapp:+' . $phone;
        }

        // Si empieza con 9 y tiene 9 dígitos, agregar +56
        if (str_starts_with($phone, '9') && strlen($phone) === 9) {
            return 'whatsapp:+56' . $phone;
        }

        // Si tiene 8 dígitos, agregar +569
        if (strlen($phone) === 8) {
            return 'whatsapp:+569' . $phone;
        }

        return null;
    } */
}