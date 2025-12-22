<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Channels\TwilioWhatsAppChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\Patient;
use App\Models\TreatmentSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Traits\NotificationUtils;
use Illuminate\Support\Facades\Log;

class PaymentReminderNotification extends Notification implements ShouldQueue, WhatsAppNotificationInterface
{
    use Queueable, NotificationUtils;

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
    public function __construct(Patient $patient, TreatmentSession $treatment_session, $session_type, int $totalAmount, int $itemCount, array $channels = ['mail'])
    {

        $this->patient = $patient;
        $this->treatment_session = $treatment_session;
        $this->session_type = $session_type;
        $this->totalAmount = $totalAmount;
        $this->itemCount = $itemCount;
        $this->channels = $channels;
    }


    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        if ($notifiable->opt_out_reminders) {
            return [];
        }

        $channels = [];

        // 2. Filtro para Email
        if ($notifiable->prefers_mail && $notifiable->email) {
            $channels[] = 'mail';
        }

        // 3. Filtro para WhatsApp (Usando tu canal personalizado)
        if ($notifiable->prefers_whatsapp && $notifiable->phone) {
            $channels[] = \App\Channels\TwilioWhatsAppChannel::class;
        }

        // 4. Filtro para SMS (Si lo tienes implementado)
        if ($notifiable->prefers_sms && $notifiable->phone) {
            $channels[] = \App\Channels\TwilioSmsChannel::class;
        }



        return $channels;
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
        $firstName = $this->getFirstName($this->getRecipientName($notifiable));
        $patientRef = $this->getPatientReference($notifiable);
        $montoFormateado = $this->formatCLP($this->totalAmount);

        return [
            'body' => "Hola {$firstName}! 👋\n\n" .
                "Tienes {$this->itemCount} sesione(s) pendiente(s) de pago en Senex {$patientRef} por un total de *{$montoFormateado}*.\n\n" .
                "---------------- * -----------------\n" .
                "Atención: {$sessionType}\n" .
                "Fecha: {$sessionDate}\n" .
                "Hora: {$sessionHour}\n\n" .
                "💳 Paga fácil con tu RUT en:\n{$portalUrl}\n\n" .
                "¿Dudas? Responde a este mensaje.",
            'event_key' => 'payment.reminder'
        ];
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
}
