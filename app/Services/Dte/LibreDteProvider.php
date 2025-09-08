<?php

namespace App\Services\Dte;

use libredte\api_client\ApiClient;
use libredte\api_client\ApiException;
use Illuminate\Support\Facades\Log;

class LibreDteProvider implements DteProvider
{
  protected ApiClient $client;
  protected string $issuerRut;

  public function __construct(?ApiClient $client = null)
  {
    $apiKey  = (string) config('dte.libredte.api_key');
    $baseUrl = (string) (config('dte.libredte.base_url') ?: 'https://libredte.cl');

    // ✅ Firma correcta: ApiClient::__construct(string $apiKey, string $baseUrl = '...').
    $this->client = $client ?: new ApiClient($apiKey, $baseUrl);

    $this->issuerRut = (string) config('dte.libredte.issuer_rut');
  }

  public function issue(array $payload, array $options = []): array
  {
    $docType = (int) ($options['type'] ?? 39);

    try {
      $resp = $this->client->post('/dte/documentos/emitir', [
        'RutEmisor' => $this->issuerRut,
        'TipoDte'   => $docType,
        'Documento' => $payload,
        'EnviaSii'  => (bool)($options['send_to_sii'] ?? true),
      ]);
    } catch (ApiException $e) {
      Log::error('LibreDTE error', ['msg' => $e->getMessage()]);
      throw new \RuntimeException('DTE_PROVIDER_ERROR: ' . $e->getMessage(), 0, $e);
    }

    return [
      'folio'    => $resp['folio']    ?? null,
      'track_id' => $resp['track_id'] ?? null,
      'status'   => $resp['estado']   ?? 'EMITIDO',
      'raw'      => $resp,
    ];
  }

  public function status(int|string $trackId): array
  {
    try {
      $resp = $this->client->get('/dte/documentos/estado', [
        'RutEmisor' => $this->issuerRut,
        'TrackId' => (string) $trackId,
      ]);
    } catch (ApiException $e) {
      Log::warning('LibreDTE: error consultando estado DTE', ['track_id' => $trackId, 'message' => $e->getMessage()]);
      return ['estado' => null, 'glosa' => $e->getMessage(), 'raw' => null];
    }


    return [
      'estado' => $resp['estado'] ?? null, // p.ej. ACEPTADO/RECHAZADO/EN_PROCESO
      'glosa' => $resp['glosa'] ?? null,
      'raw' => $resp,
    ];
  }
}
