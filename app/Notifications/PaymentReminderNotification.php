<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Channels\TwilioWhatsAppChannel;
use App\Models\Patient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $totalDeuda;
    protected $cantidadItems;
    protected $channels;

    /**
     * Create a new notification instance.
     *
     * @param int $totalDeuda Total de la deuda en CLP
     * @param int $cantidadItems Cantidad de items pendientes
     * @param array $channels Canales: ['mail', 'sms', 'whatsapp']
     */
    public function __construct(int $totalDeuda, int $cantidadItems, array $channels = ['mail'])
    {
        $this->totalDeuda = $totalDeuda;
        $this->cantidadItems = $cantidadItems;
        $this->channels = $channels;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        $availableChannels = [];

        foreach ($this->channels as $channel) {
            if ($channel === 'mail' && $notifiable->email) {
                $availableChannels[] = 'mail';
            }
            if ($channel === 'sms' && $notifiable->phone) {
                $availableChannels[] = TwilioSmsChannel::class;
            }
            if ($channel === 'whatsapp' && $notifiable->phone) {
                $availableChannels[] = TwilioWhatsAppChannel::class;
            }
        }

        return $availableChannels;
    }

    /**
     * Get the mail representation.
     */
    public function toMail($notifiable): MailMessage
    {
        $portalUrl = route('portal.pago');
        $firstName = explode(' ', $notifiable->name)[0];

        return (new MailMessage)
            ->subject('Tienes pagos pendientes en KineMobile')
            ->greeting("Hola {$firstName}")
            ->line("Tienes {$this->cantidadItems} pago(s) pendiente(s) por un total de " . $this->formatCLP($this->totalDeuda) . ".")
            ->line('Puedes pagar fácilmente desde nuestro portal:')
            ->action('Pagar ahora', $portalUrl)
            ->line('Solo necesitas tu RUT para consultar y pagar.')
            ->salutation('Saludos, KineMobile');
    }

    /**
     * Get the SMS representation.
     */
    public function toSms($notifiable): array
    {
        $portalUrl = route('portal.pago');
        
        return [
            'body' => "KineMobile: Tienes pagos pendientes por " . $this->formatCLP($this->totalDeuda) . ". Paga fácil en: {$portalUrl}",
        ];
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toWhatsApp($notifiable): array
    {
        $portalUrl = route('portal.pago');
        $firstName = explode(' ', $notifiable->name)[0];

        return [
            'body' => "Hola {$firstName}! 👋\n\n" .
                      "Tienes {$this->cantidadItems} pago(s) pendiente(s) en KineMobile por un total de *" . $this->formatCLP($this->totalDeuda) . "*.\n\n" .
                      "💳 Paga fácil con tu RUT en:\n{$portalUrl}\n\n" .
                      "¿Dudas? Responde a este mensaje.",
        ];
    }

    /**
     * Format amount to CLP
     */
    private function formatCLP(int $amount): string
    {
        return '$' . number_format($amount, 0, ',', '.');
    }
}