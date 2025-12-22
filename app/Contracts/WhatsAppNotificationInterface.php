<?php

namespace App\Contracts;

/**
 * Este contrato asegura que la notificación tenga la estructura 
 * necesaria para ser enviada por nuestro canal de WhatsApp.
 */
interface WhatsAppNotificationInterface
{
  /**
   * Debe retornar un array con:
   * ['body' => 'texto del mensaje', 'event_key' => 'tipo.evento']
   */
  public function toTwilioWhatsAppChannel($notifiable): array;
}
