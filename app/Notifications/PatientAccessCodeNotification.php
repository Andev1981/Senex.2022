<?php

namespace App\Notifications;

use App\Models\PatientAccessCode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PatientAccessCodeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public PatientAccessCode $accessCode
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['mail'];

        // TODO: Agregar SMS si el paciente tiene teléfono
        // if ($notifiable->phone) {
        //     $channels[] = 'sms';
        // }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $expiresInMinutes = now()->diffInMinutes($this->accessCode->expires_at);

        return (new MailMessage)
            ->subject('Tu código de acceso a KineMobile')
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Has solicitado acceder a tu portal de paciente.')
            ->line('Tu código de acceso es:')
            ->line('## **' . $this->accessCode->code . '**')
            ->line('Este código es válido por **' . $expiresInMinutes . ' minutos**.')
            ->line('Si no solicitaste este código, puedes ignorar este mensaje.')
            ->salutation('Equipo KineMobile');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'code' => $this->accessCode->code,
            'expires_at' => $this->accessCode->expires_at->toISOString(),
        ];
    }
}