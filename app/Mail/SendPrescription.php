<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class SendPrescription extends Mailable
{
    use Queueable, SerializesModels;

    public $prescription;
    public $pdf;

    /**
     * Create a new message instance.
     *
     * @return void
     */

    public function __construct($prescription)
    {
        $this->prescription = $prescription;

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $data = $this->prescription->toArray();

        $this->pdf = PDF::loadView("admin.receta.pdf",$data);

        return $this->from('atencion@dermalink.cl','Consulta Dermatológica')->view('mails.prescription')->attachData($this->pdf->output(), 'receta-dermalink.pdf',[
            'mime' => 'application/pdf',
        ]);
    }
}
