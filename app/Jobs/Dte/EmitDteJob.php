<?php

namespace App\Jobs\Dte;

use App\Models\Invoice;
use App\Services\Dte\DteProvider;
use App\Services\Dte\LibreDtePayloadMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EmitDteJob implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public int $tries = 3; // reintentos
  public int $backoff = 10; // segundos entre intentos (puedes usar array [10, 60, 300])

  public function __construct(
    public int $invoiceId,
    public ?int $branchId = null,
  ) {}
  public function handle(DteProvider $provider, LibreDtePayloadMapper
  $mapper): void
  {

    $invoice = Invoice::with(['companySetting', 'patient', 'items'])->findOrFail($this->invoiceId);
    $payload = $mapper->map($invoice);
    $resp = $provider->issue($payload, [
      'type' => (int) ($invoice->dte_type ?? 39),
      'send_to_sii' => true,
    ]);
    // Persistir en Invoice
    $invoice->update([
      'dte_folio' => $resp['folio'] ?? null,
      'dte_track_id' => $resp['track_id'] ?? null,
      'dte_status' => $resp['status'] ?? 'EMITIDO',
      'dte_provider' => 'libredte',
    ]);
    // Encolar chequeo de estado si tenemos track_id
    if (!empty($resp['track_id'])) {
      CheckDteStatusJob::dispatch($invoice->id)->delay(now()->addMinutes(5));
    }
  }
}
