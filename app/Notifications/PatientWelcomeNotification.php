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
        if (!$notifiable->opt_out_reminders) {
            return [];
        }

        $channels = [];

        // 2. Filtro para Email
        if ($notifiable->prefers_mail && $notifiable->email) {
            $channels[] = 'mail';
        }

        // 3. Filtro para WhatsApp (Usando tu canal personalizado)
        if ($notifiable->prefers_whatsapp && $notifiable->phone) {
            $channels[] = TwilioWhatsAppChannel::class;
        }

        // 4. Filtro para SMS (Si lo tienes implementado)
        if ($notifiable->prefers_sms && $notifiable->phone) {
            $channels[] = TwilioSmsChannel::class;
        }

        Log::error('PatientWelcomeNotification: Data', [
            'Notifiable: ' => $notifiable,
            'Chanels: ' => $channels,
        ]);

        return $channels;
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        // Usamos la "inteligencia" del Trait (como un atributo dinámico)
        $nombreRecibe = $this->getFirstName($this->getRecipientName($notifiable));
        $referencia = $this->getPatientReference($notifiable);
        $clinica = config('app.name');

        return [
            'body' => "¡Hola {$nombreRecibe}! 👋 Bienvenido/a a {$clinica}.\n\n" .
                "Hemos registrado correctamente la ficha{$referencia}. Por este medio te enviaremos recordatorios de citas y estados de cuenta.\n\n" .
                "¡Estamos felices de tenerte con nosotros!",
            'event_key' => 'patient.welcome'
        ];
    }

    /**
     * Get the mail representation.
     */
    public function toMail($notifiable): MailMessage
    {
        $recipientName = $this->getRecipientName($notifiable);
        $firstName = $this->getFirstName($recipientName);
        $referencia = $this->getPatientReference($notifiable);

        return (new MailMessage)
            ->subject("¡Bienvenido/a a KineMobile!")
            ->greeting("Hola {$firstName},")
            ->line("Te damos la más cordial bienvenida a nuestra clínica.")
            ->line("Hemos creado exitosamente la ficha de atención{$referencia}.")
            ->line("Desde ahora, recibirás por este medio información sobre tus citas y estados de pago.")
            ->salutation("Saludos equipo, " . config('app.name'));
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
