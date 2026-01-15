<?php

namespace App\Jobs\Dte;

use App\Models\Dte;
use App\Models\DteConfiguration;
use App\Models\Invoice;
use App\Services\Dte\DteFoliosService;
use App\Services\Dte\LibreDteLocalProvider;
use App\Services\Dte\LibreDtePayloadMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Mail\DteEmissionFailed;
use Illuminate\Support\Facades\Mail;

class EmitDteJob implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public int $tries = 3; // reintentos
  public int $backoff = 10; // segundos entre intentos (puedes usar array [10, 60, 300])

  public function __construct(
    public int $invoiceId,
    public ?int $branchId = null,
  ) {}
  public function handle(LibreDteLocalProvider $provider, LibreDtePayloadMapper
  $mapper, DteFoliosService $folio): void
  {

    $invoice = Invoice::with(['patient', 'items'])->findOrFail($this->invoiceId);
    $payload = $mapper->mapInvoiceToPayload($invoice);
    $companySetting = DteConfiguration::find($invoice->company_id);
    $folioService = $folio->reservarFolio($invoice->company_id, $companySetting->rut, $invoice->dte_type);
    $objetoFolios = $folioService['objetoFolios'];
    $folioReservado = $folioService['folioReservado'];

    $resp = $provider->issue($payload, $companySetting, $objetoFolios);
    
    // Crear registro en tabla dtes (Fuente de verdad del Track ID)
    if (!empty($resp['track_id'])) {
        Dte::create([
            'company_id' => $invoice->company_id,
            'branch_id' => $invoice->branch_id,
            'origin_type' => get_class($invoice),
            'origin_id' => $invoice->id,
            'type' => $invoice->dte_type,
            'folio' => $folioReservado,
            'rut_emisor' => $companySetting->rut_emisor ?? '',
            'rut_receptor' => $invoice->patient->rut ?? '',
            'total_monto_clp' => $invoice->amount_total_clp,
            'estado_sii' => $resp['status'] ?? 'ENVIADO',
            'track_id' => $resp['track_id'],
            'xml_data' => $resp['xml'] ?? null, // Si el proveedor devuelve el XML
        ]);
    }

    // Persistir estado en Invoice
    $invoice->update([
      'dte_folio' => $folioReservado,
      'dte_status' => $resp['status'] ?? 'ENVIADO',
      'dte_provider' => 'libredte',
    ]);
    // Encolar chequeo de estado si tenemos track_id
    if (!empty($resp['track_id'])) {
      // Cambiamos el estado a uno que indique que estamos esperando al SII
    $invoice->update(['dte_status' => 'WAITING_SII']);
      CheckDteStatusJob::dispatch($invoice->id)->delay(now()->addMinutes(5));
    } else {
      // SI NO HAY TRACK_ID: Algo salió mal en la comunicación pero no saltó el catch
      // Es vital marcarlo para que no pienses que se emitió bien.
      $invoice->update([
          'dte_status' => 'ERROR_NO_TRACK',
          'dte_notes' => 'El proveedor no retornó Track ID. Revisar manualmente.'
      ]);
    }
  }

  public function failed(\Throwable $exception): void
  {
      $invoice = Invoice::with('patient')->find($this->invoiceId);
      
      if ($invoice) {
          // 1. Actualizar estado en DB
          $invoice->update([
              'dte_status' => 'FAILED',
              'metadata' => $exception->getMessage()
          ]);

          // 2. Enviar correo al Administrador (o al dueño de la clínica)
          // Puedes usar una dirección fija o el correo de la configuración
          $adminEmail = config('mail.admin_address'); 
          Mail::route('mail', $adminEmail)->notify(new DteEmissionFailed($invoice,$exception->getMessage()));
      }
}
}
