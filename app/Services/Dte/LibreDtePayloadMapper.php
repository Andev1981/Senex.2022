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

    // 4. DATOS DEL RECEPTOR
    // Para Boletas (39/41) a consumidor final, se usa el genérico.
    // Para Facturas (33) o Notas de Crédito asociadas (61), se usan datos reales.
    $rutReceptor = '66666666-6'; // Genérico por defecto
    $razonSocial = 'Consumidor Final';

    // Lógica: Si es Factura (33) o si el cliente tiene RUT válido y lo solicita
    if ($tipoDte === 33 || ($cliente && $cliente->rut && $tipoDte !== 39 && $tipoDte !== 41)) {
      $rutReceptor = $cliente->rut;
      $razonSocial = $cliente->full_name ?? $cliente->business_name;
    }

    // 5. CONSTRUCCIÓN DEL ENCABEZADO
    $encabezado = [
      'IdDoc' => [
        'TipoDTE' => $tipoDte,
        'Folio'   => 0, // El folio se asigna al firmar si pasas el CAF, o puedes pasarlo aquí si ya lo reservaste ($invoice->dte_folio)
        'FchEmis' => Carbon::parse($invoice->issue_date)->format('Y-m-d'),
        // 'IndServicio' => 3, // Solo para boletas de servicios (Opcional, ver documentación SII)
      ],
      'Emisor' => [
        'RUTEmisor'  => $config['rut_empresa'], // O $config->rut_empresa
        'RznSoc'     => mb_substr($config['razon_social'] ?? 'Emisor', 0, 100),
        'GiroEmis'   => mb_substr($config['giro'] ?? 'Servicios Médicos', 0, 80),
        'Acteco'     => $config['acteco'] ?? 869090,
        'DirOrigen'  => mb_substr($config['direccion'] ?? '', 0, 60),
        'CmnaOrigen' => mb_substr($config['comuna'] ?? 'Santiago', 0, 20),
      ],
      'Receptor' => [
        'RUTRecep'    => $rutReceptor,
        'RznSocRecep' => mb_substr($razonSocial, 0, 100),
        'DirRecep'    => mb_substr($cliente->address_line ?? 'S/D', 0, 70),
        'CmnaRecep'   => mb_substr($cliente->commune_name ?? 'S/D', 0, 20),
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
