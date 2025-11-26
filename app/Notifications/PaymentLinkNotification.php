<?php

namespace App\Notifications;

use App\Models\PaymentLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public PaymentLink $paymentLink
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['mail'];

        // TODO: Agregar SMS/WhatsApp si está configurado
        // if ($notifiable->phone && config('services.sms.enabled')) {
        //     $channels[] = 'sms';
        // }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $amountFormatted = number_format($this->paymentLink->amount, 0, ',', '.');
        $expiresAt = $this->paymentLink->expires_at->format('d/m/Y H:i');

        $message = (new MailMessage)
            ->subject('Tienes un nuevo pago pendiente - KineMobile')
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Tienes un nuevo pago pendiente en KineMobile.')
            ->line('**Concepto:** ' . $this->paymentLink->description)
            ->line('**Monto:** $' . $amountFormatted . ' CLP');

        // Si permite pago parcial
        if ($this->paymentLink->allow_partial_payment && $this->paymentLink->minimum_amount) {
            $minimumFormatted = number_format($this->paymentLink->minimum_amount, 0, ',', '.');
            $message->line('**Monto mínimo:** $' . $minimumFormatted . ' CLP');
            $message->line('Puedes realizar pagos parciales desde el monto mínimo.');
        }

        $message->action('Pagar Ahora', $this->paymentLink->public_url)
                ->line('Este link es válido hasta: **' . $expiresAt . '**')
                ->line('Puedes pagar de forma segura con Webpay.')
                ->line('Si tienes dudas, contacta a tu centro de kinesiología.');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_link_id' => $this->paymentLink->id,
            'token' => $this->paymentLink->token,
            'amount' => $this->paymentLink->amount,
            'description' => $this->paymentLink->description,
            'expires_at' => $this->paymentLink->expires_at->toISOString(),
            'url' => $this->paymentLink->public_url,
        ];
    }
}