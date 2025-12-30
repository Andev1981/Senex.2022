<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileProxyController extends Controller
{
    /**
     * Sirve archivos de adjuntos (clínicos, etc.) desde el disco privado.
     */
    public function streamAttachment(Attachment $attachment): StreamedResponse
    {
        // 1. Verificar permiso (El trait Multitenantable ya debería filtrar por empresa, 
        // pero reforzamos con policy si es necesario)
        $this->authorize('view', $attachment);

        if (!Storage::disk('private')->exists($attachment->storage_path)) {
            abort(404, 'Archivo no encontrado en el almacenamiento privado.');
        }

        return Storage::disk('private')->response($attachment->storage_path, $attachment->title);
    }

    /**
     * Sirve los PDFs de Invoices/Boletas desde el disco privado.
     */
    public function streamInvoicePdf(Invoice $invoice): StreamedResponse
    {
        $this->authorize('view', $invoice);

        if (!$invoice->pdf_path || !Storage::disk('private')->exists($invoice->pdf_path)) {
            abort(404, 'El PDF de este documento no está disponible.');
        }

        $filename = "Documento_{$invoice->dte_type}_{$invoice->dte_folio}.pdf";

        return Storage::disk('private')->response($invoice->pdf_path, $filename);
    }

    /**
     * Sirve la firma digital del doctor desde el disco privado.
     */
    public function streamDoctorSignature(\App\Models\Doctor $doctor): StreamedResponse
    {
        // Solo usuarios autorizados pueden ver la firma (por ahora solo el mismo doctor o admin)
        $this->authorize('view', $doctor);

        if (!$doctor->signature_path || !Storage::disk('private')->exists($doctor->signature_path)) {
            abort(404, 'Firma no encontrada.');
        }

        return Storage::disk('private')->response($doctor->signature_path);
    }
}
