<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class UserWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;
    protected $password;

    public function __construct(User $user, string $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $roleNames = $this->user->getRoleNames()->map(fn($r) => ucfirst($r))->implode(', ');
        $companyName = $this->user->company->business_name ?? config('app.name');

        return (new MailMessage)
            ->subject("✅ ¡Bienvenido a {$companyName}!")
            ->greeting("Hola {$this->user->name},")
            ->line("Tu cuenta ha sido creada exitosamente en nuestro sistema de gestión.")
            ->line("Se te ha asignado el rol de: **{$roleNames}**.")
            ->line("Aquí tienes tus credenciales de acceso:")
            ->panel("Email: **{$this->user->email}**\nContraseña: `{$this->password}`")
            ->action('Ingresar al Sistema', route('login'))
            ->line('Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.')
            ->line('¡Esperamos que tengas una excelente experiencia trabajando con nosotros!');
    }
}
