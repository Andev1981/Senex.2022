<?php

namespace App\Services\Dte;

use App\Models\Invoice;

class LibreDtePayloadMapper
{
  /**
   * Mapea Invoice + Items a estructura esperada por LibreDTE.
   * Soporta documentos afectos (IVA) y exentos.
   */
  public function map(Invoice $invoice): array
  {
    $emisor = $invoice->companySetting; // asume relación
    $receptor = $invoice->patient; // asume relación
    $items = $invoice->items; // asume relación ->InvoiceItem[]
    $isExempt = (bool) ($invoice->is_exempt ?? false);
    $neto = (int) $invoice->net_amount; // tu modelo debe tenerlo olo calculas
    $iva = $isExempt ? 0 : (int) $invoice->tax_amount;
    $total = (int) $invoice->total_amount;
    $detalle = [];
    foreach ($items as $i => $item) {
      $line = [
        'NmbItem' => $item->name,
        'QtyItem' => (float) ($item->quantity ?? 1),
        'PrcItem' => (int) $item->unit_price,
        'MontoItem' => (int) $item->total,
      ];
      if ($item->is_exempt ?? false) {
        $line['IndExe'] = 1; // línea exenta
      }
      $detalle[] = $line;
    }
    $encabezado = [
      'IdDoc' => [
        'TipoDTE' => (int) ($invoice->dte_type ?? 39), // 39 boleta, 33 factura, 61 NC
        'Folio' => 0,
      ],
      'Emisor' => [
        'RUTEmisor' => $emisor->rut ??
          config('dte.libredte.issuer_rut'),
        'RznSoc' => $emisor->business_name ?? 'Emisor',
        'GiroEmis' => $emisor->business_activity ?? 'Servicios
profesionales',
        'Acteco' => $emisor->acteco ?? '869090',
        'DirOrigen' => $emisor->address_line ?? 'S/D',
        'CmnaOrigen' => $emisor->commune_name ?? 'S/D',
      ],
      'Receptor' => [
        'RUTRecep' => $receptor->rut ?? '66666666-6',
        'RznSocRecep' => trim(($receptor->full_name) ?? 'Paciente'),
        'DirRecep' => $receptor->address_line ?? 'S/D',
        'CmnaRecep' => $receptor->commune_name ?? 'S/D',
      ],
      'Totales' => $isExempt ? [
        'MntExe' => $total,
        'MntTotal' => $total,
      ] : [
        'MntNeto' => $neto,
        'IVA' => $iva,
        'MntTotal' => $total,
      ],
    ];
    return [
      'Encabezado' => $encabezado,
      'Detalle' => $detalle,
    ];
  }
}
