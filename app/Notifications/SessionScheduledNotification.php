<?php

namespace App\Notifications;

use App\Channels\TwilioWhatsAppChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\TreatmentSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SessionScheduledNotification extends Notification implements ShouldQueue, WhatsAppNotificationInterface
{
    use Queueable;

    protected $session;

    /**
     * Create a new notification instance.
     */
    public function __construct(TreatmentSession $session)
    {
        $this->session = $session;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        $channels = [];

        // Determinar preferencias (Si no tiene la propiedad, asumimos TRUE por defecto, ej: Tutor)
        $wantsMail = $notifiable->prefers_mail ?? true;
        $wantsWhatsapp = $notifiable->prefers_whatsapp ?? true;

        // Preferencia Email
        if ($wantsMail && $notifiable->email) {
            $channels[] = 'mail';
        }

        // Preferencia WhatsApp
        if ($wantsWhatsapp && $notifiable->phone) {
            $channels[] = TwilioWhatsAppChannel::class;
        }

        Log::info('SessionScheduledNotification::via Check', [
            'recipient_id' => $notifiable->id,
            'type' => class_basename($notifiable),
            'wants_mail' => $wantsMail,
            'has_email' => !empty($notifiable->email),
            'wants_whatsapp' => $wantsWhatsapp,
            'has_phone' => !empty($notifiable->phone),
            'channels_selected' => $channels
        ]);

        return $channels;
    }

    /**
     * Get the WhatsApp representation of the notification.
     */
    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $date = Carbon::parse($this->session->date)->format('d/m/Y');
        $time = Carbon::parse($this->session->time)->format('H:i');
        
        $isPatient = $notifiable instanceof \App\Models\Patient;
        $patientName = $this->session->patient ? $this->session->patient->name : 'el paciente';

        if ($isPatient) {
            $msg = "Hola {$notifiable->name}, te confirmamos *tu sesión* para el día *{$date}* a las *{$time}*.\n\nTe esperamos.";
        } else {
            $msg = "Hola {$notifiable->name}, te confirmamos la sesión de *{$patientName}* para el día *{$date}* a las *{$time}*.\n\nLos esperamos.";
        }

        return ['body' => "✅ *Hora Agendada*\n\n" . $msg];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $date = Carbon::parse($this->session->date)->format('d/m/Y');
        $time = Carbon::parse($this->session->time)->format('H:i');
        $doctorName = $this->session->doctor ? $this->session->doctor->full_name : 'un profesional de nuestro equipo';
        
        $isPatient = $notifiable instanceof \App\Models\Patient;
        $patientName = $this->session->patient ? $this->session->patient->name : 'el paciente';

        $mail = (new MailMessage)
            ->subject('✅ Hora Agendada: ' . $date . ' a las ' . $time)
            ->greeting('Hola ' . $notifiable->name . ',');

        if ($isPatient) {
            $mail->line('Tu sesión ha sido agendada exitosamente.');
        } else {
            $mail->line("La sesión de {$patientName} ha sido agendada exitosamente.");
        }

        return $mail
            ->line('📅 Fecha: ' . $date)
            ->line('⏰ Hora: ' . $time)
            ->line('👨‍⚕️ Profesional: ' . $doctorName)
            ->line('📍 Lugar: ' . ($this->session->branch ? $this->session->branch->address : 'Sucursal Principal'))
            ->action('Ver Atenciones', route('patient.login'))
            ->line('¡Nos vemos pronto!');
    }

    
}
