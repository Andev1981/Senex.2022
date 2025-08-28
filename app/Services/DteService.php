<?php

namespace App\Services;

use LibreDTE\Sii\Firma;
use LibreDTE\Sii\Dte;
use Illuminate\Support\Facades\Storage;
use Exception;

class DteService
{
  protected Firma $firma;
  protected string $emisorRut;

  /**
   * Constructor: carga el certificado y configura el emisor
   */
  public function __construct()
  {
    $certPath = config('libredte.certificado_path');
    $clave = config('libredte.certificado_clave');

    // Validar que el certificado exista
    if (!file_exists($certPath)) {
      throw new Exception("❌ Certificado no encontrado en: $certPath");
    }

    // Crear firma electrónica
    $this->firma = new Firma($certPath, $clave);

    // RUT del emisor
    $this->emisorRut = config('libredte.emisor_rut');
  }

  /**
   * Emite una boleta electrónica
   *
   * @param array $datos
   * @return array
   */
  public function emitirBoletaElectronica(array $datos): array
  {
    // Obtener el siguiente folio
    $folio = $this->obtenerSiguienteFolio();

    // Datos del DTE (estructura exigida por el SII)
    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 39, // Boleta Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => $datos['emisor']['razon_social'] ?? config('app.name'),
          'GiroEmis' => $datos['emisor']['giro'] ?? 'Sin giro',
          'DirOrigen' => $datos['emisor']['direccion'] ?? 'Sin dirección',
          'CmnaOrigen' => $datos['emisor']['comuna'] ?? 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'] ?? '66.666.666-6', // Consumidor final
          'RznSocRecep' => $datos['receptor']['nombre'] ?? 'Cliente Final',
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Consumo Final',
          'DirRecep' => $datos['receptor']['direccion'] ?? 'Sin dirección',
          'CmnaRecep' => $datos['receptor']['comuna'] ?? 'Santiago',
        ],
      ],
      'Detalle' => $this->prepararDetalles($datos['detalles']),
      'Totales' => [
        'MntTotal' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem'))
      ]
    ];

    // Crear el objeto DTE
    $dte = new Dte($dteData);
    $dte->setFirma($this->firma);

    // Modo homologación (prueba)
    if (config('libredte.ambiente') === 'homologacion') {
      $dte->setModelo(1); // Activa modo prueba
    }

    // Generar el XML firmado
    $xml = $dte->getXML();

    // Guardar en storage
    $nombreArchivo = "boleta_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    // Retornar información útil
    return [
      'folio' => $folio,
      'tipo' => 39,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
      'ruta_xml' => Storage::path("dtes/xml/{$nombreArchivo}"),
    ];
  }

  public function emitirBoletaExenta(array $datos): array
  {
    $folio = $this->obtenerSiguienteFolio();

    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 39,
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => 'Mi Empresa Ltda.',
          'GiroEmis' => 'Asesoría exenta',
          'DirOrigen' => 'Av. Ejemplo 123',
          'CmnaOrigen' => 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'] ?? '66.666.666-6',
          'RznSocRecep' => $datos['receptor']['nombre'] ?? 'Cliente Final',
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Consumo Final',
          'DirRecep' => $datos['receptor']['direccion'] ?? 'Sin dirección',
          'CmnaRecep' => $datos['receptor']['comuna'] ?? 'Santiago',
        ],
      ],
      'Detalle' => [
        [
          'NmbItem' => $datos['detalles'][0]['nombre'],
          'QtyItem' => $datos['detalles'][0]['cantidad'] ?? 1,
          'PrcItem' => $datos['detalles'][0]['precio'],
          'MontoItem' => $datos['detalles'][0]['precio'] * ($datos['detalles'][0]['cantidad'] ?? 1),
          'IndExe' => 1, // ✅ Indica que es exento
        ]
      ],
      'Totales' => [
        'MntTotal' => $datos['detalles'][0]['precio'] * ($datos['detalles'][0]['cantidad'] ?? 1),
      ]
    ];

    $dte = new Dte($dteData);
    $dte->setFirma($this->firma);

    if (config('libredte.ambiente') === 'homologacion') {
      $dte->setModelo(1);
    }

    $xml = $dte->getXML();
    $nombre = "boleta_exenta_{$folio}.xml";
    Storage::put("dtes/xml/{$nombre}", $xml);

    return [
      'folio' => $folio,
      'xml' => $xml,
      'archivo_xml' => $nombre,
      'url_xml' => Storage::url("dtes/xml/{$nombre}"),
    ];
  }

  /**
   * Prepara los detalles del DTE
   */
  private function prepararDetalles(array $detalles): array
  {
    return array_map(function ($item) {
      return [
        'NmbItem' => $item['nombre'],
        'QtyItem' => $item['cantidad'] ?? 1,
        'PrcItem' => $item['precio'],
        'MontoItem' => ($item['cantidad'] ?? 1) * $item['precio'],
      ];
    }, $detalles);
  }

  /**
   * Obtiene el siguiente folio (en producción, usa la BD)
   */
  private function obtenerSiguienteFolio(): int
  {
    // 🔜 En producción: consulta la BD para obtener el último folio + 1
    // Por ahora, usamos un ejemplo simple con cache
    $ultimo = cache('ultimo_folio_boleta', 0);
    $nuevo = $ultimo + 1;
    cache(['ultimo_folio_boleta' => $nuevo], now()->addYear());
    return $nuevo;
  }
}
