<?php

namespace App\Services\Dte;

use App\Models\Invoice;
use Carbon\Carbon;

class LibreDtePayloadMapper
{
  /**
   * Mapea Invoice + Items a la estructura de array esperada por LibreDTE.
   * * @param Invoice $invoice El modelo de la venta.
   * @param mixed $config Configuración de la empresa (Rut, giro, etc).
   * @param int $tipoDte El tipo de documento a emitir (33, 39, 41, 61).
   * @param array|null $referenciaData Datos para la sección <Referencia> (Solo Notas de Crédito/Débito).
   */
  public function mapInvoiceToPayload(Invoice $invoice, $config, int $tipoDte, ?array $referenciaData = null): array
  {
    // 1. CARGA DE RELACIONES (Idealmente ya vienen cargadas con Eager Loading)
    $items = $invoice->items; // Relación hasMany InvoiceItem
    $cliente = $invoice->patient; // O la relación polimórfica 'entity' si soportas empresas

    // 2. MAPEO DE DETALLE (ITEMS)
    $detalle = [];

    foreach ($items as $i => $item) {
      // LibreDTE espera precios unitarios.
      // Si es Boleta (39/41), se suele enviar precio Bruto.
      // Si es Factura (33), se suele enviar Neto, pero depende de tu configuración de LibreDTE.
      // Asumiremos que tu DB guarda Bruto en 'unit_price_clp'.

      $line = [
        'NmbItem' => mb_substr($item->description, 0, 80), // Limitar largo por seguridad
        'QtyItem' => round($item->quantity, 4),
        'PrcItem' => (int) $item->unit_price_clp,
      ];

      // Manejo de Exención por línea (Clave para Boletas Mixtas Tipo 39)
      if ($item->is_exento) {
        $line['IndExe'] = 1;
      }

      // Opcional: Código del item si lo tienes
      // $line['CdgItem'] = ...

      $detalle[] = $line;
    }

    // 3. PREPARAR TOTALES (Usamos los cálculos guardados en la BD)
    // Esto evita errores de redondeo al recalcular.
    $totales = [
      'MntTotal' => (int) $invoice->total_amount_clp,
    ];

    // Si hay monto neto > 0, agregamos el desglose de IVA
    if ($invoice->net_amount_clp > 0) {
      $totales['MntNeto'] = (int) $invoice->net_amount_clp;
      $totales['IVA']     = (int) $invoice->vat_amount_clp;
    }

    // Si hay monto exento > 0
    if ($invoice->exempt_amount_clp > 0) {
      $totales['MntExe'] = (int) $invoice->exempt_amount_clp;
    }

    // 4. DATOS DEL RECEPTOR (Desde Metadata o Relación)
    $clientMeta = data_get($invoice->metadata, 'client', []);
    $rutReceptor = $clientMeta['rut'] ?? '66666666-6';
    $razonSocial = $clientMeta['name'] ?? 'Consumidor Final';
    $giroReceptor = $clientMeta['giro'] ?? 'PARTICULAR';

    // 5. CONSTRUCCIÓN DEL ENCABEZADO
    $company = $invoice->company;
    
    // Formatear RUT Emisor (Garantizar guion y DV para LibreDTE)
    $rutEmisorRaw = preg_replace('/[^0-9Kk]/', '', $config['company_rut']);
    $rutEmisor = substr($rutEmisorRaw, 0, -1) . '-' . substr($rutEmisorRaw, -1);

    $encabezado = [
      'IdDoc' => [
        'TipoDTE' => $tipoDte,
        'Folio'   => $invoice->dte_folio ?? 0,
        'FchEmis' => Carbon::parse($invoice->issue_date)->format('Y-m-d'),
      ],
      'Emisor' => [
        'RUTEmisor'  => $rutEmisor, 
        'RznSoc'     => mb_substr($company->business_name ?? 'Emisor', 0, 100),
        'GiroEmis'   => mb_substr($company->giro ?? 'Servicios', 0, 80),
        'Acteco'     => $config['acteco'] ?? 620100, //   Valor por defecto para servicios médicos
        'DirOrigen'  => mb_substr($company->address ?? 'Santiago', 0, 60),
        'CmnaOrigen' => mb_substr($company->commune?->name ?? 'Santiago', 0, 20),
      ],
      'Receptor' => [
        'RUTRecep'    => $rutReceptor,
        'RznSocRecep' => mb_substr($razonSocial, 0, 100),
        'GiroRecep'   => mb_substr($giroReceptor, 0, 40),
        'DirRecep'    => mb_substr($clientMeta['address'] ?? 'S/D', 0, 70),
        'CmnaRecep'   => mb_substr($clientMeta['commune'] ?? 'S/D', 0, 20),
      ],
      'Totales' => $totales,
    ];

    // 6. ARMADO FINAL
    $payload = [
      'Encabezado' => $encabezado,
      'Detalle'    => $detalle,
    ];

    // 7. INYECCIÓN DE REFERENCIA (Solo para Notas de Crédito/Débito)
    if (!empty($referenciaData)) {
      $payload['Referencia'] = $referenciaData;
    }

    return $payload;
  }
}
