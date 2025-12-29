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
        $nombreRecibe = $this->getFirstName($this->getRecipientName($notifiable));
        $referencia = $this->getPatientReference($notifiable);
        $clinica = config('app.name');

        return [
            'body' => "🌟 *¡Bienvenido/a a {$clinica}!* 🌟\n\n" .
                "Hola {$nombreRecibe}, es un gusto saludarte. Hemos activado con éxito tu ficha digital{$referencia} en nuestro sistema médico.\n\n" .
                "A partir de ahora, este será nuestro canal oficial para:\n" .
                "✅ Confirmación de citas\n" .
                "✅ Recordatorios de atención\n" .
                "✅ Estados de cuenta y boletas\n\n" .
                "Estamos comprometidos con tu bienestar. ¡Nos vemos pronto!",
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
        $clinica = config('app.name');

        return (new MailMessage)
            ->subject("✨ ¡Te damos la bienvenida a {$clinica}!")
            ->greeting("Hola {$firstName},")
            ->line("Es un placer saludarte. Te informamos que hemos creado exitosamente tu expediente clínico{$referencia} en nuestra plataforma.")
            ->line("En {$clinica} nos esforzamos por ofrecerte una atención de excelencia, apoyada por tecnología de vanguardia para el seguimiento de tu tratamiento.")
            ->line("A través de este correo te mantendremos informado sobre:")
            ->line("• Agendamiento y reprogramación de sesiones.")
            ->line("• Documentos tributarios y comprobantes de pago.")
            ->line("• Evolución y objetivos de tu plan de salud.")
            ->action("Ver mi Ficha en Línea", url('/'))
            ->line("Gracias por confiar en nuestro equipo de profesionales.")
            ->salutation("Cordialmente,\nEquipo " . $clinica);
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
