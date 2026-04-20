<?php
use App\Models\DteConfiguration;
use App\Services\Dte\LibreDteLocalProvider;
use Illuminate\Support\Facades\Crypt;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

echo "--- [CONSULTA ESTADO TRACKID 11927247984] ---" . PHP_EOL;

$config = DteConfiguration::where('company_id', 1)->first();
$certFullPath = storage_path('app/private/' . $config->certificate_path);
$password = Crypt::decryptString($config->certificate_password);

$provider = $app->make(LibreDteLocalProvider::class);
$status = $provider->status('11927247984', [
    'certificate_path' => $certFullPath,
    'certificate_pass' => $password,
    'environment' => 'certification'
]);

print_r($status);
