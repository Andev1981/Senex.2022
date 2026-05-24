<?php

namespace App\Notifications;

use App\Channels\OpenWAChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\Patient;
use App\Models\TreatmentSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Traits\NotificationUtils;
use Carbon\Carbon;

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
        // El switch "opt_out_reminders" bloquea todo si está en TRUE.
        if ($notifiable->opt_out_reminders) {
            return [];
        }

        $activeChannels = [];
        
        // Determinar preferencias (Asumimos TRUE por defecto si no están seteadas)
        $wantsMail = $notifiable->prefers_mail ?? true;
        $wantsWhatsapp = $notifiable->prefers_whatsapp ?? true;

        // 1. Filtro para Email
        if ($wantsMail && $notifiable->email) {
            $activeChannels[] = 'mail';
        }

        // 2. Filtro para WhatsApp (OpenWA)
        if ($wantsWhatsapp && $notifiable->phone) {
            $activeChannels[] = OpenWAChannel::class;
        }

        return $activeChannels;
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $portalUrl = route('portal.pago');
        $sessionType = $this->session_type;
        $sessionDate = $this->treatment_session['date'];
        $sessionHour = $this->treatment_session['time'];
        $firstName = $this->getFirstName($this->getRecipientName($notifiable));
        $patientRef = $this->getPatientReference($notifiable);
        $montoFormateado = $this->formatCLP($this->totalAmount);

        $instrucciones = $this->treatment_session->item?->serviceDetail?->patient_instructions;
        $instruccionesStr = $instrucciones ? "\n\n💡 *Instrucciones:* {$instrucciones}" : "";

        return [
            'body' => "Hola {$firstName}! 👋\n\n" .
                "Tienes {$this->itemCount} sesione(s) pendiente(s) de pago en Senex {$patientRef} por un total de *{$montoFormateado}*.\n\n" .
                "---------------- * -----------------\n" .
                "Atención: {$sessionType}\n" .
                "Fecha: {$sessionDate}\n" .
                "Hora: {$sessionHour}{$instruccionesStr}\n\n" .
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
        $firstName = $this->getFirstName($this->getRecipientName($notifiable));
        
        $instrucciones = $this->treatment_session->item?->serviceDetail?->patient_instructions;

        $message = (new MailMessage)
            ->subject('Tienes pagos pendientes en KineMobile')
            ->greeting("Hola {$firstName}")
            ->line("Tienes {$this->itemCount} pago(s) pendiente(s) por un total de " . $this->formatCLP($this->totalAmount) . ".")
            ->line('Detalles de la atención pendiente:')
            ->line("- **Servicio:** {$this->session_type}")
            ->line("- **Fecha:** " . Carbon::parse($this->treatment_session['date'])->format('d/m/Y'));

        if ($instrucciones) {
            $message->line("- **Instrucciones:** {$instrucciones}");
        }

        return $message
            ->line('Puedes pagar fácilmente desde nuestro portal:')
            ->action('Pagar ahora', $portalUrl)
            ->line('Solo necesitas tu RUT para consultar y pagar.')
            ->salutation('Saludos, KineMobile');
    }
}
