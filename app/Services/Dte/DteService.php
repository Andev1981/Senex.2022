<?php

namespace App\Services\Dte;

use App\Models\Invoice;
use Illuminate\Support\Facades\Log;
use Throwable;

class DteService
{
  public function __construct(
    private readonly DteProvider $provider,
    private readonly LibreDtePayloadMapper $mapper,
  ) {}

  /**
   * Emite un DTE para la invoice dada y persiste folio/track/status.
   * @throws \RuntimeException si el proveedor falla
   */
  public function emit(Invoice $invoice, array $options = []): array
  {
    $invoice->loadMissing(['items', 'patient', 'company']);

    // Mapear a payload LibreDTE
    $payload = $this->mapper->map($invoice);

    // Normalizar opciones (tipo y envío a SII)
    $opts = [
      'type' => (int)($invoice->type ?? ($options['type'] ?? 39)),
      'send_to_sii' => (bool)($options['send_to_sii'] ?? true),
    ];
    try {
      $resp = $this->provider->issue($payload, $opts);
    } catch (Throwable $e) {
      Log::error('DTE emit failed', [
        'invoice_id' => $invoice->id,
        'message' => $e->getMessage(),
      ]);
      throw new \RuntimeException('No se pudo emitir el DTE: ' . $e->getMessage(), 0, $e);
    }

    // Persistir en invoice (ajusta campos a tu schema)
    $invoice->update([
      'folio' => $resp['folio'] ?? null,
      'track_id' => $resp['track_id'] ?? null,
      'status' => $resp['status'] ?? ($invoice->status ?? 'EMITIDO'),
      'raw_response' => $resp['raw'] ?? null,
    ]);

    return $resp;
  }

  /**
   * Consulta estado en proveedor (si lo soporta) y actualiza Invoice.
   * Retorna array con estado/glosa/raw si aplica.
   */
  public function checkStatus(Invoice $invoice): ?array
  {
    if (! $invoice->track_id) {
      return null;
    }

    if (! $this->provider instanceof DteProvider) {
      // El proveedor actual no soporta status()
      return null;
    }

    try {
      $resp = $this->provider->status($invoice->track_id);
    } catch (Throwable $e) {
      Log::warning('DTE status failed', [
        'invoice_id' => $invoice->id,
        'track_id' => $invoice->track_id,
        'message' => $e->getMessage(),
      ]);
      return null;
    }

    // Mapea a tus campos (ajusta nombres si usas otros)
    $estado = $resp['estado'] ?? null; // p.ej. ACEPTADO/RECHAZADO/EN_PROCESO
    $invoice->update([
      'status' => $estado ?: $invoice->status,
      'raw_status' => $resp,
    ]);

    return $resp;
  }
}
