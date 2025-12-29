<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Pdf;

class SendInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invoice;

    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice->load(['patient', 'company', 'branch', 'items']);
    }

    public function build()
    {
        $email = $this->subject('Tu comprobante de pago: ' . $this->invoice->type_name . ' #' . ($this->invoice->dte_folio ?? $this->invoice->id))
                    ->view('emails.invoices.send');

        // 1. Adjuntar el PDF oficial si existe (SII)
        if ($this->invoice->pdf_path && Storage::exists($this->invoice->pdf_path)) {
            $email->attachFromStorage($this->invoice->pdf_path, 'Boleta_' . ($this->invoice->dte_folio ?? 'SII') . '.pdf', [
                'mime' => 'application/pdf',
            ]);
        }

        // 2. Generar y Adjuntar el Comprobante Interno (Diseño profesional)
        // Buscamos el pago asociado para tener el desglose completo
        $payment = Payment::with([
            'patient', 'company', 'branch', 
            'paymentAllocation.treatmentSession.sessionType', 
            'receivables.insurance'
        ])->find($this->invoice->payment_id);

        if ($payment) {
            $pdf = Pdf::loadView('pdf.payment_receipt', compact('payment'));
            $email->attachData($pdf->output(), 'Comprobante_Pago_' . strtoupper(substr($payment->uuid, 0, 8)) . '.pdf', [
                'mime' => 'application/pdf',
            ]);
        }

        return $email;
    }
}
