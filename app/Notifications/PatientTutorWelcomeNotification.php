<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Channels\TwilioWhatsAppChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\Patient;
use App\Models\PatientContact;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Traits\NotificationUtils;

class PatientTutorWelcomeNotification extends Notification implements ShouldQueue, WhatsAppNotificationInterface
{
    use Queueable, NotificationUtils;

    protected Patient $patient;
    protected PatientContact $contact;

    public function __construct(Patient $patient, PatientContact $contact)
    {
        $this->patient = $patient;
        $this->contact = $contact;
    }

    public function via($notifiable): array
    {
        // En este caso el $notifiable es el PatientContact (el tutor)
        $channels = ['mail'];
        if (config('services.twilio.whatsapp_from')) {
            $channels[] = TwilioWhatsAppChannel::class;
        }
        return $channels;
    }

    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $nombreTutor = $this->getFirstName($notifiable->name);
        $nombrePaciente = $this->patient->name;
        $clinica = config('app.name');

        return [
            'body' => "🤝 *¡Hola {$nombreTutor}! Bienvenido/a a {$clinica}* 🤝\n\n" .
                "Te informamos que has sido registrado como *Tutor Responsable* de la ficha médica de *{$nombrePaciente}*.\n\n" .
                "Como apoderado, recibirás por este canal:\n" .
                "📅 Agendamiento de citas\n" .
                "💳 Estados de cuenta y recaudación\n" .
                "📈 Seguimiento del plan de salud\n\n" .
                "Estamos a tu disposición para cualquier consulta. ¡Gracias por confiar en nosotros!",
            'event_key' => 'tutor.welcome'
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $nombreTutor = $this->getFirstName($notifiable->name);
        $nombrePaciente = $this->patient->full_name;
        $clinica = config('app.name');

        return (new MailMessage)
            ->subject("🤝 Registro de Tutor Responsable - {$clinica}")
            ->greeting("Hola {$nombreTutor},")
            ->line("Te damos la bienvenida a {$clinica}. Este correo confirma que has sido registrado como el apoderado responsable de la ficha clínica de:")
            ->line("**Paciente:** {$nombrePaciente}")
            ->line("Como tutor, centralizaremos contigo toda la información técnica y administrativa relacionada con el tratamiento.")
            ->line("Desde ahora recibirás notificaciones sobre citas, planes de tratamiento y documentos de facturación.")
            ->action("Acceder al Portal", url('/'))
            ->line("Agradecemos tu confianza en nuestro equipo médico.")
            ->salutation("Cordialmente,\nEquipo " . $clinica);
    }
}