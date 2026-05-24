<?php

namespace App\Notifications;

use App\Channels\TwilioWhatsAppChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Traits\NotificationUtils;

class AppointmentConfirmationNotification extends Notification implements ShouldQueue, WhatsAppNotificationInterface
{
    use Queueable, NotificationUtils;

    protected Appointment $appointment;
    protected $channels;

    public function __construct(Appointment $appointment, array $channels = ['mail'])
    {
        $this->appointment = $appointment->load(['patient', 'doctor', 'item.serviceDetail', 'room', 'company']);
        $this->channels = $channels;
    }

    public function via($notifiable): array
    {
        $activeChannels = [];
        $targetChannels = !empty($this->channels) ? $this->channels : ['mail'];

        if (in_array('mail', $targetChannels) && $notifiable->email) {
            $activeChannels[] = 'mail';
        }

        if (in_array('whatsapp', $targetChannels) && $notifiable->phone) {
            $activeChannels[] = TwilioWhatsAppChannel::class;
        }

        return $activeChannels;
    }

    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $patientName = $this->getFirstName($notifiable->name);
        $clinica = $this->appointment->company->business_name ?? config('app.name');
        $fecha = $this->appointment->start_at->format('d/m/Y');
        $hora = $this->appointment->start_at->format('H:i');
        $doctor = $this->appointment->doctor->name;
        $servicio = $this->appointment->item->name;
        $sala = $this->appointment->room ? "en la sala " . $this->appointment->room->name : "";
        
        $instrucciones = $this->appointment->item?->serviceDetail?->patient_instructions;
        $instruccionesStr = $instrucciones ? "\n\n💡 *Instrucciones:* {$instrucciones}" : "";

        $confirmUrl = \Illuminate\Support\Facades\URL::signedRoute('appointment.confirm', ['appointment' => $this->appointment->id]);
        $cancelUrl = \Illuminate\Support\Facades\URL::signedRoute('appointment.cancel', ['appointment' => $this->appointment->id]);
        $paymentUrl = route('portal.pago.magic', ['rut' => $this->appointment->patient->rut]);

        return [
            'body' => "📅 *Confirmación de Cita - {$clinica}*\n\n" .
                "Hola *{$patientName}*, confirmamos tu cita para:\n\n" .
                "🗓️ *Fecha:* {$fecha}\n" .
                "⏰ *Hora:* {$hora}\n" .
                "👨‍⚕️ *Kinesiólogo:* {$doctor}\n" .
                "🩺 *Servicio:* {$servicio}\n" .
                "📍 *Lugar:* {$sala}{$instruccionesStr}\n\n" .
                "✅ *Confirmar asistencia:* {$confirmUrl}\n" .
                "❌ *Cancelar cita:* {$cancelUrl}\n" .
                "💳 *Pagar anticipadamente:* {$paymentUrl}\n\n" .
                "Por favor, llega 5 minutos antes. ¡Te esperamos!",
            'event_key' => 'appointment.confirmation'
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $clinica = $this->appointment->company->business_name ?? config('app.name');
        $confirmUrl = \Illuminate\Support\Facades\URL::signedRoute('appointment.confirm', ['appointment' => $this->appointment->id]);
        $cancelUrl = \Illuminate\Support\Facades\URL::signedRoute('appointment.cancel', ['appointment' => $this->appointment->id]);
        $paymentUrl = route('portal.pago.magic', ['rut' => $this->appointment->patient->rut]);
        
        $instrucciones = $this->appointment->item?->serviceDetail?->patient_instructions;

        $message = (new MailMessage)
            ->subject("📅 Confirmación de Cita: {$this->appointment->start_at->format('d/m/Y H:i')}")
            ->greeting("Hola {$notifiable->name},")
            ->line("Tu cita en {$clinica} ha sido agendada con éxito.")
            ->line("Detalles de la cita:")
            ->line("- **Fecha:** " . $this->appointment->start_at->format('d/m/Y'))
            ->line("- **Hora:** " . $this->appointment->start_at->format('H:i'))
            ->line("- **Profesional:** " . $this->appointment->doctor->name)
            ->line("- **Servicio:** " . $this->appointment->item->name)
            ->line("- **Sala:** " . ($this->appointment->room->name ?? 'Por confirmar'));

        if ($instrucciones) {
            $message->line("- **Instrucciones importantes:** {$instrucciones}");
        }

        return $message
            ->action('Confirmar Asistencia', $confirmUrl)
            ->line("Si necesitas cancelar, puedes hacerlo aquí: [Cancelar Cita]({$cancelUrl})")
            ->line("También puedes pagar tu sesión de forma anticipada aquí: [Pagar Ahora]({$paymentUrl})")
            ->line('¡Gracias por confiar en nosotros!');
    }
}
