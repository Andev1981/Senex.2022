<?php

namespace App\Jobs;

use App\Models\Patient; // Necesario para el type hint
use App\Models\TreatmentSession;
use App\Notifications\PaymentReminderNotification; // Tu notificación
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPaymentReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Propiedades para almacenar los datos que pasan del Service al Job
    public Patient $patient;
    public TreatmentSession $treatment_session;
    public string $session_type;
    public int $totalAmount;
    public int $itemCount;
    public array $channels;

    /**
     * Crea una nueva instancia del Job.
     * @param Patient $patient El paciente a notificar.
     * @param int $totalAmount El monto total pendiente.
     * @param int $itemCount La cantidad de ítems pendientes.
     * @param array $channels Los canales solicitados (ej: ['mail', 'whatsapp']).
     */
    public function __construct(Patient $patient,TreatmentSession $treatment_session,$session_type, int $totalAmount, int $itemCount, array $channels)
    {
        // El constructor asigna los argumentos a las propiedades del Job
        
        
        $this->patient = $patient;
        $this->treatment_session = $treatment_session;
        $this->session_type = $session_type;
        $this->totalAmount = $totalAmount;
        $this->itemCount = $itemCount;
        $this->channels = $channels;
        
    }

    /**
     * Ejecuta el trabajo.
     * Aquí es donde se realiza la acción de negocio.
     */
    public function handle(): void
    {
        // El Job simplemente le dice al Patient que se notifique, 
        // y la clase PaymentReminderNotification se encarga del contenido 
        // y del filtrado de canales (método via()).

        
        $this->patient->notify(new PaymentReminderNotification(
            $this->patient,
             $this->treatment_session,
            $this->session_type, 
            $this->totalAmount, 
            $this->itemCount, 
            $this->channels
        ));
    }
}