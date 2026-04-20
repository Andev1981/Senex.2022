<?php

use App\Models\Invoice;
use App\Models\DteConfiguration;
use App\Models\AuthorizedFolio;
use App\Services\Dte\LibreDteLocalProvider;
use App\Services\Dte\DteFoliosService;
use App\Services\Dte\LibreDtePayloadMapper;
use sasco\LibreDTE\Sii\Folios;
use Illuminate\Support\Facades\Crypt;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

echo "--- [DTE FULL FLOW TEST] ---" . PHP_EOL;

// 1. Configuración de la Empresa
$companyId = 1;
$dteConfig = DteConfiguration::where('company_id', $companyId)->first();

if (!$dteConfig) {
    echo "ERROR: Configuración DTE no encontrada para Company ID $companyId" . PHP_EOL;
    exit(1);
}

// 2. Obtener Folio (CAF) para Tipo 41 (Boleta Exenta)
$authFolio = AuthorizedFolio::where('company_id', $companyId)
    ->where('tipo_dte', 41)
    ->where('environment', 'certification')
    ->where('activo', 1)
    ->first();

if (!$authFolio) {
    echo "ERROR: No hay folios autorizados para Tipo 41 en certificación." . PHP_EOL;
    exit(1);
}

$folio = $authFolio->ultimo_folio_usado + 1;
echo "Usando Folio: $folio para Tipo 41" . PHP_EOL;

// 3. Construir Payload de Prueba Mínimo para Boleta
$payload = [
    'Encabezado' => [
        'IdDoc' => [
            'TipoDTE' => 41,
            'Folio' => $folio,
            'FchEmis' => date('Y-m-d'),
            'IndServicio' => 3, // Boleta de servicios
        ],
        'Emisor' => [
            'RUTEmisor' => $dteConfig->company_rut,
            'RznSoc' => 'SERVICIOS PROFESIONALES SYSMED LIMITADA',
            'GiroEmis' => 'ACTIVIDADES DE PROGRAMACION INFORMATICA',
            'Acteco' => 620100,
            'DirOrigen' => 'ARTURO PRAT #625 DEPTO. #34',
            'CmnaOrigen' => 'SAN BERNARDO',
        ],
        'Receptor' => [
            'RUTRecep' => '66666666-6',
        ],
        'Totales' => [
            'MntTotal' => 1000,
            'MntExe' => 1000,
        ],
    ],
    'Detalle' => [
        [
            'NmbItem' => 'Servicio medico',
            'QtyItem' => 1,
            'PrcItem' => 1000,
            'MontoItem' => 1000,
        ]
    ]
];

// 4. Preparar Proveedor
$certFullPath = storage_path('app/private/' . $dteConfig->certificate_path);
$password = Crypt::decryptString($dteConfig->certificate_password);

$configProvider = [
    'company_rut' => $dteConfig->company_rut,
    'certificate_path' => $certFullPath,
    'certificate_password' => $password,
    'environment' => $dteConfig->environment,
    'resolution_date' => '2014-08-22', // Valores estandar para certificacion
    'resolution_number' => '80',
];

try {
    echo "Iniciando proceso de emisión..." . PHP_EOL;
    
    $foliosService = $app->make(DteFoliosService::class);
    $mapper = $app->make(LibreDtePayloadMapper::class);
    $firmaDte = new \sasco\LibreDTE\FirmaElectronica(['file' => $certFullPath, 'pass' => $password]);
    
    $provider = new LibreDteLocalProvider($firmaDte, $foliosService, $mapper);
    
    $objetoFolios = new Folios($authFolio->caf_xml);
    
    list($trackId, $xml) = $provider->issue($payload, $configProvider, $objetoFolios);
    
    echo "¡ÉXITO!" . PHP_EOL;
    echo "TrackID: $trackId" . PHP_EOL;
    
    // Guardar el XML generado para inspección si es necesario
    file_put_contents('test_generated_dte.xml', $xml);
    echo "XML guardado en test_generated_dte.xml" . PHP_EOL;

    // Actualizar el folio en la BD si fue exitoso
    $authFolio->ultimo_folio_usado = $folio;
    $authFolio->save();
    echo "Folio actualizado en la base de datos." . PHP_EOL;

} catch (\Exception $e) {
    echo "ERROR DURANTE LA EMISIÓN: " . $e->getMessage() . PHP_EOL;
}
