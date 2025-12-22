<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Channels\TwilioWhatsAppChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\Patient;
use App\Models\PatientContact;
use App\Models\TreatmentSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Traits\NotificationUtils;
use Illuminate\Support\Facades\Log;

class PatientTutorWelcomeNotification extends Notification implements ShouldQueue, WhatsAppNotificationInterface
{
    use Queueable, NotificationUtils;

    protected PatientContact $patientContact;
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
    public function __construct(Patient $patient, PatientContact $patientContact, array $channels = ['mail'])
    {

        $this->patientContact = $patientContact;
        $this->patient = $patient;
        $this->channels = $channels;
    }


    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        if (!$this->patient->opt_out_reminders) {
            return [];
        }

        $channels = [];

        // 2. Filtro para Email
        if ($this->patient->prefers_mail && $notifiable->email) {
            $channels[] = 'mail';
        }

        // 3. Filtro para WhatsApp (Usando tu canal personalizado)
        if ($this->patient->prefers_whatsapp && $notifiable->phone) {
            $channels[] = TwilioWhatsAppChannel::class;
        }

        // 4. Filtro para SMS (Si lo tienes implementado)
        if ($this->patient->prefers_sms && $notifiable->phone) {
            $channels[] = TwilioSmsChannel::class;
        }

        // Si después de los filtros el array sigue vacío, lanzamos la alerta
        if (empty($channels)) {
            $errorMsg = "La notificación de bienvenida no se envió porque el paciente (ID: {$this->patient->id}) " .
                "no tiene canales habilitados o faltan datos en el contacto (ID: {$notifiable->id}).";

            // Opción 1: Solo Log (Seguro para producción)
            Log::warning($errorMsg);

            // Opción 2: Lanzar Excepción (Solo si estás en desarrollo para que el sistema "explote" y te des cuenta)
            if (config('app.env') === 'local') {
                throw new \Exception($errorMsg);
            }
        }

        return $channels;
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        // Usamos la "inteligencia" del Trait (como un atributo dinámico)
        // Usamos el Trait para limpiar los nombres si quieres
        $nombreTutor = $this->getFirstName($this->patientContact->name);
        $nombrePaciente = $this->patient->name; // El nombre del niño/a

        return [
            'body' => "¡Hola {$nombreTutor}! 👋\n\n" .
                "Le damos la bienvenida a Senex Senior. Hemos registrado la ficha clínica de *{$nombrePaciente}*.\n\n" .
                "Desde ahora, usted recibirá las notificaciones de citas y estados de pago correspondientes a su pupilo.",
            'event_key' => 'tutor.welcome'
        ];
    }

    /**
     * Get the mail representation.
     */
    public function toMail($notifiable): MailMessage
    {
        $nombreTutor = $this->getFirstName($this->patientContact->name);
        $nombrePaciente = $this->patient->name;
        $clinica = config('app.name', 'Senex Senior');

        return (new MailMessage)
            ->subject("Bienvenido a {$clinica} - Registro de {$nombrePaciente}")
            ->greeting("Hola {$nombreTutor},")
            ->line("Le damos la bienvenida a nuestra clínica.")
            ->line("Se ha registrado correctamente la ficha de atención de **{$nombrePaciente}**, y usted ha sido asignado como el contacto responsable.")
            ->line("A partir de ahora, recibirá en este correo:")
            ->line("• Confirmaciones y recordatorios de citas.")
            ->line("• Estados de cuenta y boletas.")
            ->line("• Información relevante sobre el tratamiento.")
            ->line("Si tiene alguna duda, puede contactarnos respondiendo a este correo.")
            ->salutation("Saludos cordiales, Equipo {$clinica}");
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
