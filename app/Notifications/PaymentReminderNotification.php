<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Channels\TwilioWhatsAppChannel;
use App\Models\Patient;
use App\Models\TreatmentSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class PaymentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Patient $patient;
    protected TreatmentSession $treatment_session;
    protected string $session_type;
    protected $totalAmount;
    protected $itemCount;
    protected $channels;

    /**
     * Create a new notification instance.
     *
     * @param int $totalAmount Total de la deuda en CLP
     * @param int $itemCount Cantidad de items pendientes
     * @param array $channels Canales: ['mail', 'sms', 'whatsapp']
     */
    public function __construct(Patient $patient,TreatmentSession $treatment_session,$session_type,int $totalAmount, int $itemCount, array $channels = ['mail'])
    {

        $this->patient = $patient;
        $this->treatment_session = $treatment_session;
        $this->session_type = $session_type;
        $this->totalAmount = $totalAmount;
        $this->itemCount = $itemCount;
        $this->channels = $channels;
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $portalUrl = route('portal.pago');
        $firstName = explode(' ', $notifiable->name)[0];
        $sessionType = $this->session_type;
        $sessionDate = $this->treatment_session['date'];
        $sessionHour = $this->treatment_session['time'];

        return [
            'body' => "Hola {$firstName}! 👋\n\n" .
                      "Tienes {$this->itemCount} pago(s) pendiente(s) en Senex por un total de *" . $this->formatCLP($this->totalAmount) . "*.\n\n" .
                      "---------------- * -----------------" .
                      "Atención: {$sessionType}\n\n" .
                      "Fecha: {$sessionDate}" .
                      "Hora: {$sessionHour}\n\n" .
                      "💳 Paga fácil con tu RUT en:\n{$portalUrl}\n\n" .
                      "¿Dudas? Responde a este mensaje.",
        ];
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
            ->line("Tienes {$this->itemCount} pago(s) pendiente(s) por un total de " . $this->formatCLP($this->totalAmount) . ".")
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
            'body' => "KineMobile: Tienes pagos pendientes por " . $this->formatCLP($this->totalAmount) . ". Paga fácil en: {$portalUrl}",
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