<?php
use App\Models\Invoice;
use App\Models\DteConfiguration;
use sasco\LibreDTE\FirmaElectronica;
use sasco\LibreDTE\Sii\Autenticacion;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

echo "--- [DTE DIAGNOSTIC] ---" . PHP_EOL;

$invoiceId = 1937;
$invoice = Invoice::find($invoiceId);

if (!$invoice) {
    echo "Factura #$invoiceId no encontrada." . PHP_EOL;
    exit(1);
}

echo "Factura ID: " . $invoice->id . PHP_EOL;
echo "Company ID: " . $invoice->company_id . PHP_EOL;

$config = DteConfiguration::where('company_id', $invoice->company_id)->first();

if (!$config) {
    echo "Configuración DTE no encontrada para la empresa " . $invoice->company_id . PHP_EOL;
    exit(1);
}

$certRelPath = $config->certificate_path;
$certFullPath = storage_path('app/private/' . $certRelPath);
$password = Crypt::decryptString($config->certificate_password);
$environment = $config->environment;

echo "Cert Path: " . $certFullPath . PHP_EOL;
echo "Cert File Exists: " . (file_exists($certFullPath) ? "YES" : "NO") . PHP_EOL;
echo "Environment: " . $environment . PHP_EOL;

if (file_exists($certFullPath)) {
    try {
        $Firma = new FirmaElectronica([
            'file' => $certFullPath,
            'pass' => $password
        ]);
        echo "Firma cargada correctamente: " . $Firma->getName() . PHP_EOL;
        echo "RUT Firma: " . $Firma->getID() . PHP_EOL;
        
        $isProduction = ($environment === 'production');
        echo "Intentando obtener Token del SII (" . ($isProduction ? 'PRODUCCIÓN' : 'CERTIFICACIÓN') . ")..." . PHP_EOL;
        
        $token = Autenticacion::getToken($Firma, $isProduction);
        
        if ($token) {
            echo "TOKEN OBTENIDO EXITOSAMENTE: " . $token . PHP_EOL;
        } else {
            echo "ERROR AL OBTENER TOKEN: LibreDTE devolvió null/false." . PHP_EOL;
            echo "Verifique conectividad con el SII o que el RUT de la firma esté enrolado." . PHP_EOL;
        }
    } catch (\Exception $e) {
        echo "ERROR CRÍTICO: " . $e->getMessage() . PHP_EOL;
    }
}
