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

class PatientWelcomeNotification extends Notification implements ShouldQueue, WhatsAppNotificationInterface
{
    use Queueable, NotificationUtils;

    protected Patient $patient;
    protected $channels;

    /**
     * Create a new notification instance.
     */
    public function __construct(Patient $patient, array $channels = ['mail'])
    {
        $this->patient = $patient;
        $this->channels = $channels;
    }


    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        $activeChannels = [];

        // Si se pasaron canales específicos al constructor, los usamos
        $targetChannels = !empty($this->channels) ? $this->channels : ['mail'];

        // 1. Filtro para Email
        if (in_array('mail', $targetChannels) && $notifiable->email) {
            $activeChannels[] = 'mail';
        }

        // 2. Filtro para WhatsApp
        if (in_array('whatsapp', $targetChannels) && $notifiable->phone) {
            $activeChannels[] = TwilioWhatsAppChannel::class;
        }

        \Log::info('PatientWelcomeNotification: Ejecutando via()', [
            'patient_id' => $notifiable->id,
            'target_channels' => $targetChannels,
            'final_channels' => $activeChannels,
            'email' => $notifiable->email,
            'phone' => $notifiable->phone
        ]);

        return $activeChannels;
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $this->patient->load('company');
        $nombreRecibe = $this->getFirstName($this->getRecipientName($notifiable));
        $referencia = $this->getPatientReference($notifiable);
        $clinica = $this->patient->company->business_name ?? config('app.name');

        return [
            'body' => "🌟 *¡Bienvenido/a a {$clinica}!* 🌟\n\n" .
                "Hola *{$nombreRecibe}*, es un gusto saludarte. Hemos activado con éxito tu ficha digital{$referencia} en nuestro sistema médico.\n\n" .
                "A partir de ahora, este será nuestro canal oficial para:\n" .
                "📅 *Confirmación de citas*\n" .
                "🔔 *Recordatorios de atención*\n" .
                "💳 *Estados de cuenta y boletas*\n\n" .
                "Estamos comprometidos con tu recuperación. ¡Nos vemos pronto!",
            'event_key' => 'patient.welcome'
        ];
    }

    /**
     * Get the mail representation.
     */
    public function toMail($notifiable): MailMessage
    {
        $this->patient->load('company.logo');
        $clinica = $this->patient->company->business_name ?? config('app.name');

        return (new MailMessage)
            ->subject("✨ ¡Te damos la bienvenida a {$clinica}!")
            ->view('emails.patients.welcome', [
                'patient' => $this->patient,
                'company' => $this->patient->company
            ]);
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
