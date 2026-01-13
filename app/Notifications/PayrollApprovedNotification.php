<?php

namespace App\Notifications;

use App\Models\Payroll;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PayrollApprovedNotification extends Notification
{
    use Queueable;

    protected $payroll;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payroll $payroll)
    {
        $this->payroll = $payroll;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Liquidación Aprobada - ' . $this->payroll->period_start->format('d/m/Y') . ' al ' . $this->payroll->period_end->format('d/m/Y'))
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Tu liquidación de honorarios para el periodo del ' . $this->payroll->period_start->format('d/m/Y') . ' al ' . $this->payroll->period_end->format('d/m/Y') . ' ha sido aprobada.')
            ->line('Monto a pagar: $' . number_format($this->payroll->total_payable_clp, 0, ',', '.'))
            ->action('Descargar Liquidación', route('payrolls.pdf', $this->payroll))
            ->line('Gracias por tu trabajo en Senex.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payroll_id' => $this->payroll->id,
            'amount' => $this->payroll->total_payable_clp,
            'status' => 'approved',
        ];
    }
}
