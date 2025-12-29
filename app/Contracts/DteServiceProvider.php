<?php

namespace App\Contracts;
use sasco\LibreDTE\Sii\Folios;

interface DteServiceProvider
{
  /**
   * Emite un DTE (boleta/factura/nota) y retorna identificadores y estado.
   * @param array $payload  Datos normalizados (emisor, receptor, items, totales, refs)
   * @param array $options  e.g. ['type' => 33, 'send_to_sii' => true]
   * @return array{folio:int|null, track_id:int|null, status:string, raw:mixed}
   */
  public function issue(array $payloadArray, array $config, Folios $objetoFolios): array;
  public function status(string|int $trackId, array $config): array;
}
