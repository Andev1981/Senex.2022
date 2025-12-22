<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use App\Services\TwilioService;
use App\Contracts\WhatsAppNotificationInterface;

class TwilioWhatsAppChannel
{


    public function __construct(protected TwilioService $twilioService) {}

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
        if (!$notification instanceof WhatsAppNotificationInterface) {
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
}
