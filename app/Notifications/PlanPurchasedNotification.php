<?php

namespace App\Notifications;

use App\Channels\OpenWAChannel;
use App\Contracts\WhatsAppNotificationInterface;
use App\Models\PatientPlan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlanPurchasedNotification extends Notification implements WhatsAppNotificationInterface
{
    use Queueable;

    protected $patientPlan;

    public function __construct(PatientPlan $patientPlan)
    {
        $this->patientPlan = $patientPlan;
    }

    public function via($notifiable): array
    {
        return ['mail', OpenWAChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        $plan = $this->patientPlan->plan;
        $clinica = $this->patientPlan->company->business_name ?? config('app.name');

        return (new MailMessage)
            ->subject("✅ ¡Bienvenido a tu nuevo Plan de Tratamiento!")
            ->greeting("Hola {$notifiable->name},")
            ->line("Te confirmamos que has adquirido exitosamente el **{$plan->name}** en {$clinica}.")
            ->line("Detalles de tu pack:")
            ->line("- **Código:** {$plan->code}")
            ->line("- **Sesiones Incluidas:** " . ($this->patientPlan->sessions_included ?: 'Ilimitadas'))
            ->line("- **Vigencia hasta:** " . ($this->patientPlan->expiry_date ? $this->patientPlan->expiry_date->format('d/m/Y') : 'Sin expiración'))
            ->action('Ver mi perfil', route('portal.pago'))
            ->line('¡Estamos felices de acompañarte en tu recuperación!');
    }

    public function toTwilioWhatsAppChannel($notifiable): array
    {
        $plan = $this->patientPlan->plan;
        $clinica = $this->patientPlan->company->business_name ?? config('app.name');
        $sesiones = $this->patientPlan->sessions_included ?: 'Ilimitadas';

        return [
            'body' => "✅ *¡Pack Adquirido! - {$clinica}*\n\n" .
                "Hola *{$notifiable->name}*, confirmamos la activación de tu:\n\n" .
                "📦 *Pack:* {$plan->name}\n" .
                "🔢 *Sesiones:* {$sesiones}\n" .
                "🗓️ *Válido hasta:* " . ($this->patientPlan->expiry_date ? $this->patientPlan->expiry_date->format('d/m/Y') : 'Indefinido') . "\n\n" .
                "Ya puedes agendar tus sesiones. ¡Te esperamos!",
            'event_key' => 'plan.purchase'
        ];
    }
}
