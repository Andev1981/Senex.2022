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
          'TipoDTE' => 41, // Boleta Exenta Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => config('app.name'),
          'GiroEmis' => 'Servicios de salud exentos',
          'DirOrigen' => 'Dirección de la empresa',
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
    $nombreArchivo = "boleta_exenta_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    return [
      'folio' => $folio,
      'tipo' => 41,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
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

  /**
   * Emite una factura electrónica
   *
   * @param array $datos
   * @return array
   */
  public function emitirFacturaElectronica(array $datos): array
  {
    $folio = $this->obtenerSiguienteFolio();

    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 33, // Factura Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => config('app.name'),
          'GiroEmis' => 'Servicios de salud',
          'DirOrigen' => 'Dirección de la empresa',
          'CmnaOrigen' => 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'],
          'RznSocRecep' => $datos['receptor']['nombre'],
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Servicios',
          'DirRecep' => $datos['receptor']['direccion'] ?? 'Sin dirección',
          'CmnaRecep' => $datos['receptor']['comuna'] ?? 'Santiago',
        ],
      ],
      'Detalle' => $this->prepararDetalles($datos['detalles']),
      'Totales' => [
        'MntNeto' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')),
        'TasaIVA' => 19,
        'IVA' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')) * 0.19,
        'MntTotal' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')) * 1.19
      ]
    ];

    $dte = new Dte($dteData);
    $dte->setFirma($this->firma);

    if (config('libredte.ambiente') === 'homologacion') {
      $dte->setModelo(1);
    }

    $xml = $dte->getXML();
    $nombreArchivo = "factura_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    return [
      'folio' => $folio,
      'tipo' => 33,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
    ];
  }

  /**
   * Emite una factura exenta electrónica
   *
   * @param array $datos
   * @return array
   */
  public function emitirFacturaExenta(array $datos): array
  {
    $folio = $this->obtenerSiguienteFolio();

    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 34, // Factura Exenta Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => config('app.name'),
          'GiroEmis' => 'Servicios de salud exentos',
          'DirOrigen' => 'Dirección de la empresa',
          'CmnaOrigen' => 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'],
          'RznSocRecep' => $datos['receptor']['nombre'],
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Servicios',
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
    $nombreArchivo = "factura_exenta_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    return [
      'folio' => $folio,
      'tipo' => 34,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
    ];
  }

  /**
   * Emite una guía de despacho electrónica
   *
   * @param array $datos
   * @return array
   */
  public function emitirGuiaDespacho(array $datos): array
  {
    $folio = $this->obtenerSiguienteFolio();

    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 52, // Guía de Despacho Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => config('app.name'),
          'GiroEmis' => 'Servicios de salud',
          'DirOrigen' => 'Dirección de la empresa',
          'CmnaOrigen' => 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'] ?? '66.666.666-6',
          'RznSocRecep' => $datos['receptor']['nombre'],
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Consumo Final',
          'DirRecep' => $datos['receptor']['direccion'] ?? 'Sin dirección',
          'CmnaRecep' => $datos['receptor']['comuna'] ?? 'Santiago',
        ],
        'Transporte' => [
          'DirDest' => $datos['direccion_entrega'] ?? $datos['receptor']['direccion'],
          'CmnaDest' => $datos['receptor']['comuna'] ?? 'Santiago',
          'FchTraslado' => $datos['fecha_entrega'] ?? date('Y-m-d'),
          'Patente' => 'XXXX00', // Patente del vehículo (opcional)
          'RUTTrans' => '66.666.666-6', // RUT del transportista (opcional)
          'NomTrans' => $datos['transportista'] ?? 'Sin especificar',
        ],
      ],
      'Detalle' => $this->prepararDetalles($datos['detalles']),
      'Totales' => [
        'MntTotal' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem'))
      ]
    ];

    $dte = new Dte($dteData);
    $dte->setFirma($this->firma);

    if (config('libredte.ambiente') === 'homologacion') {
      $dte->setModelo(1);
    }

    $xml = $dte->getXML();
    $nombreArchivo = "guia_despacho_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    return [
      'folio' => $folio,
      'tipo' => 52,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
    ];
  }

  /**
   * Emite una nota de débito electrónica
   *
   * @param array $datos
   * @return array
   */
  public function emitirNotaDebito(array $datos): array
  {
    $folio = $this->obtenerSiguienteFolio();

    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 56, // Nota de Débito Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => config('app.name'),
          'GiroEmis' => 'Servicios de salud',
          'DirOrigen' => 'Dirección de la empresa',
          'CmnaOrigen' => 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'],
          'RznSocRecep' => $datos['receptor']['nombre'],
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Servicios',
          'DirRecep' => $datos['receptor']['direccion'] ?? 'Sin dirección',
          'CmnaRecep' => $datos['receptor']['comuna'] ?? 'Santiago',
        ],
        'Referencia' => [
          'TpoDocRef' => 33, // Tipo de documento referenciado (Factura)
          'FolioRef' => $datos['folio_referencia'],
          'FchRef' => $datos['fecha_referencia'] ?? date('Y-m-d'),
          'RazonRef' => $datos['motivo'] ?? 'Cargo adicional',
        ],
      ],
      'Detalle' => $this->prepararDetalles($datos['detalles']),
      'Totales' => [
        'MntNeto' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')),
        'TasaIVA' => 19,
        'IVA' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')) * 0.19,
        'MntTotal' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')) * 1.19
      ]
    ];

    $dte = new Dte($dteData);
    $dte->setFirma($this->firma);

    if (config('libredte.ambiente') === 'homologacion') {
      $dte->setModelo(1);
    }

    $xml = $dte->getXML();
    $nombreArchivo = "nota_debito_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    return [
      'folio' => $folio,
      'tipo' => 56,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
    ];
  }

  /**
   * Emite una nota de crédito electrónica
   *
   * @param array $datos
   * @return array
   */
  public function emitirNotaCredito(array $datos): array
  {
    $folio = $this->obtenerSiguienteFolio();

    $dteData = [
      'Encabezado' => [
        'IdDoc' => [
          'TipoDTE' => 61, // Nota de Crédito Electrónica
          'Folio' => $folio,
          'FchEmis' => date('Y-m-d'),
        ],
        'Emisor' => [
          'RUTEmisor' => $this->emisorRut,
          'RznSoc' => config('app.name'),
          'GiroEmis' => 'Servicios de salud',
          'DirOrigen' => 'Dirección de la empresa',
          'CmnaOrigen' => 'Santiago',
        ],
        'Receptor' => [
          'RUTRecep' => $datos['receptor']['rut'],
          'RznSocRecep' => $datos['receptor']['nombre'],
          'GiroRecep' => $datos['receptor']['giro'] ?? 'Servicios',
          'DirRecep' => $datos['receptor']['direccion'] ?? 'Sin dirección',
          'CmnaRecep' => $datos['receptor']['comuna'] ?? 'Santiago',
        ],
        'Referencia' => [
          'TpoDocRef' => 33, // Tipo de documento referenciado (Factura)
          'FolioRef' => $datos['folio_referencia'],
          'FchRef' => $datos['fecha_referencia'] ?? date('Y-m-d'),
          'RazonRef' => $datos['motivo'] ?? 'Descuento o devolución',
        ],
      ],
      'Detalle' => $this->prepararDetalles($datos['detalles']),
      'Totales' => [
        'MntNeto' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')),
        'TasaIVA' => 19,
        'IVA' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')) * 0.19,
        'MntTotal' => array_sum(array_column($this->prepararDetalles($datos['detalles']), 'MontoItem')) * 1.19
      ]
    ];

    $dte = new Dte($dteData);
    $dte->setFirma($this->firma);

    if (config('libredte.ambiente') === 'homologacion') {
      $dte->setModelo(1);
    }

    $xml = $dte->getXML();
    $nombreArchivo = "nota_credito_{$folio}.xml";
    Storage::put("dtes/xml/{$nombreArchivo}", $xml);

    return [
      'folio' => $folio,
      'tipo' => 61,
      'total' => $dteData['Totales']['MntTotal'],
      'xml' => $xml,
      'archivo_xml' => $nombreArchivo,
      'url_xml' => Storage::url("dtes/xml/{$nombreArchivo}"),
    ];
  }

}
