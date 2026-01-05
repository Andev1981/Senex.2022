<?php

use App\Models\Invoice;
use App\Models\Company;
use App\Models\User;
use App\Models\Branch;
use App\Models\Patient;
use App\Models\DteConfiguration;
use App\Services\Dte\DteService;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Iniciando prueba de modo simulación DTE...\n";

try {
    DB::beginTransaction();

    // 1. Setup Data
    $company = Company::first();
    if (!$company) {
        $company = Company::factory()->create();
    }
    
    // Ensure DTE Config exists and is set to simulation
    $config = DteConfiguration::updateOrCreate(
        ['company_id' => $company->id],
        [
            'rut_empresa' => '76.123.456-7',
            'certificado_path' => 'dummy/path/cert.pfx', // Path valid check is inside provider but we bypass it with simulation, wait, provider checks new FirmaElectronica BEFORE simulation? No, check provider code.
            // Ah, provider code: 
            // 1. Mock Check
            // 2. new FirmaElectronica
            // So simulation check happens first. Good.
            'certificado_password' => encrypt('secret'),
            'ambiente' => 'certificacion',
            'simulation_mode' => true
        ]
    );

    $branch = Branch::where('company_id', $company->id)->first();
    if (!$branch) $branch = Branch::factory()->create(['company_id' => $company->id]);
    
    $user = User::first();
    if (!$user) $user = User::factory()->create();

    $patient = Patient::first();
    if (!$patient) $patient = Patient::factory()->create();

    // 2. Create Invoice
    $invoice = Invoice::create([
        'company_id' => $company->id,
        'branch_id' => $branch->id,
        'user_id' => $user->id,
        'patient_id' => $patient->id,
        'entity_type' => 'App\Models\Patient',
        'entity_id' => $patient->id,
        'dte_type' => 39,
        'dte_folio' => null, // Let service assign it
        'issue_date' => now(),
        'amount_neto_clp' => 1000,
        'amount_exento_clp' => 0,
        'amount_iva_clp' => 190,
        'amount_total_clp' => 1190,
        'dte_status' => 'pending',
        'payment_status' => 'pending',
        'metadata' => ['client' => ['rut' => '1.111.111-1', 'razonSocial' => 'Test Client']]
    ]);
    
    echo "Factura creada ID: {$invoice->id}\n";

    // 3. Invoke Service
    $dteService = app(DteService::class);
    $trackId = $dteService->issueInvoiceDte($invoice);

    echo "DTE Emitido. Track ID: {$trackId}\n";

    // 4. Assert
    if (strlen($trackId) >= 7 && $invoice->fresh()->dte_status === 'sent') {
         echo "PRUEBA EXITOSA: Simulation Mode activo y funcionando.\n";
    } else {
         echo "PRUEBA FALLIDA: Track ID sospechoso o estado incorrecto.\n";
    }

    DB::rollBack(); // Always rollback test data
    echo "Transacción revertida.\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR EXCEPCION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
