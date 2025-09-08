<?php

namespace Tests\Fakes;

use App\Services\Dte\DteProvider;

class FakeDteProvider implements DteProvider
{
  public function issue(array $payload, array $options = []): array
  {
    return [
      'folio' => 123,
      'track_id' => 456,
      'status' => 'EMITIDO',
      'raw' => ['fake' => true],
    ];
  }
  public function status(int|string $trackId): array
  {
    return [
      'estado' => 'ACEPTADO',
      'glosa'  => 'OK',
      'raw'    => ['track' => $trackId],
    ];
  }
}
