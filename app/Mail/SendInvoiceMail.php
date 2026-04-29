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
        $this->invoice = $invoice->load(['patient', 'company.logo', 'branch.primaryAddress.commune', 'items']);
    }

    public function build()
    {
        $email = $this->subject('Comprobante de Pago: ' . ($this->invoice->patient->full_name ?? $this->invoice->patient->name))
                    ->view('emails.invoices.send');

        // 1. Adjuntar el PDF oficial SOLO si existe (SII)
        // Por ahora comentamos esto si el usuario prefiere que no se mencione como boleta oficial
        /*
        if ($this->invoice->pdf_path && Storage::exists($this->invoice->pdf_path)) {
            $email->attachFromStorage($this->invoice->pdf_path, 'Boleta_' . ($this->invoice->dte_folio ?? 'SII') . '.pdf', [
                'mime' => 'application/pdf',
            ]);
        }
        */

        // 2. Generar y Adjuntar el Comprobante Interno (Diseño profesional)
        // Buscamos el pago asociado para tener el desglose completo
        // Usamos la relación inversa desde Invoice -> PaymentAllocation -> Payment
        $allocation = $this->invoice->paymentAllocations()->with('payment')->first();
        $payment = $allocation ? $allocation->payment : null;

        if ($payment) {
            // Cargar relaciones necesarias para el PDF
            $payment->load([
                'patient', 'company', 'branch.primaryAddress.commune', 
                'paymentAllocations.invoice.items',
                'paymentAllocations.treatmentSession.item', 
                'receivables.insurance'
            ]);

            $pdf = Pdf::loadView('pdf.payment_receipt', compact('payment'));
            $email->attachData($pdf->output(), 'Comprobante_Pago_' . strtoupper(substr($payment->uuid, 0, 8)) . '.pdf', [
                'mime' => 'application/pdf',
            ]);
        }

        return $email;
    }
}
