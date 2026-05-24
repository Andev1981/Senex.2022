<?php

namespace App\Notifications;

use App\Channels\OpenWAChannel;
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
        return ['mail', OpenWAChannel::class];
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $this->patient->load('company');
        $nombreTutor = $this->getFirstName($notifiable->name);
        $nombrePaciente = $this->patient->name;
        $clinica = $this->patient->company->business_name ?? config('app.name');

        return [
            'body' => "🤝 *¡Hola {$nombreTutor}! Bienvenido/a a {$clinica}* 🤝\n\n" .
                "Te informamos que has sido registrado como *Tutor Responsable* de la ficha médica de *{$nombrePaciente}*.\n\n" .
                "Como apoderado, recibirás por este canal:\n" .
                "📅 *Agendamiento de citas*\n" .
                "💳 *Estados de cuenta y recaudación*\n" .
                "📈 *Seguimiento del plan de salud*\n\n" .
                "Estamos a tu disposición para cualquier consulta. ¡Gracias por confiar en nosotros!",
            'event_key' => 'tutor.welcome'
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
            ->subject("🤝 Registro de Tutor Responsable - {$clinica}")
            ->view('emails.patients.tutor_welcome', [
                'patient' => $this->patient,
                'company' => $this->patient->company,
                'contact' => $this->contact
            ]);
    }
}