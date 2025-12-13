<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DteEmissionFailed extends Mailable
{
    use Queueable, SerializesModels;

    public $invoice;
    public $errorMessage;

    /**
     * @param Invoice $invoice La instancia de la factura
     * @param string $errorMessage El mensaje del error capturado en el Job
     */
    public function __construct(Invoice $invoice, string $errorMessage)
    {
        // Cargamos la relación del paciente para tener el nombre en el correo
        $this->invoice = $invoice->load('patient');
        $this->errorMessage = $errorMessage;
    }

    public function build()
    {
        return $this->subject('⚠️ Error Crítico: Fallo en Emisión de DTE #' . $this->invoice->id)
                    ->view('emails.dte.emission_failed') // Debes crear esta vista
                    ->with([
                        'patientName' => $this->invoice->patient->full_name ?? 'N/A',
                        'amount_clp' => number_format($this->invoice->total_amount, 0, ',', '.'),
                        'error' => $this->errorMessage,
                    ]);
    }
}