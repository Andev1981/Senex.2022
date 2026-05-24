<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use App\Services\OpenWAService;
use App\Contracts\WhatsAppNotificationInterface;

class OpenWAChannel
{
    public function __construct(protected OpenWAService $openWAService) {}

    /**
     * Enviar la notificación vía OpenWA
     */
    public function send($notifiable, Notification $notification)
    {
        if (!$notification instanceof WhatsAppNotificationInterface) {
            Log::error('OpenWAChannel: La notificación no implementa WhatsAppNotificationInterface', [
                'notification' => get_class($notification)
            ]);
            return;
        }

        $messageData = $notification->toTwilioWhatsAppChannel($notifiable);
        $body = $messageData['body'];

        // Usamos el teléfono del notifiable
        $toPhone = $notifiable->phone;

        if (!$toPhone) {
            Log::warning('OpenWAChannel: El destinatario no tiene teléfono configurado');
            return;
        }

        if (!$this->openWAService->isConfigured()) {
            Log::warning('OpenWAChannel: Servicio OpenWA no configurado');
            return;
        }

        $success = $this->openWAService->sendWhatsApp($toPhone, $body);

        if (!$success) {
            Log::error('OpenWAChannel: Falló el envío del mensaje', [
                'notifiable_id' => $notifiable->id,
                'phone' => $toPhone
            ]);
        }
    }
}
