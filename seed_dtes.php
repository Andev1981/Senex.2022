<?php
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Company;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;

$company = Company::first();
$branch = Branch::where('company_id', $company->id)->first();
$user = User::where('email', 'javt1981@gmail.com')->first();
$patient = Patient::first();

// Crear una Empresa Receptora para Facturas
$empresaReceptora = Patient::updateOrCreate(
    ['rut' => '77.888.999-0'],
    [
        'name' => 'Clinica Los Andes',
        'last_name' => 'SpA',
        'company_id' => $company->id,
        'status' => 'active',
        'email' => 'adquisiciones@losandes.cl'
    ]
);

$docs = [
    [
        'type' => 39, // Boleta
        'receptor' => $patient,
        'items' => [
            ['desc' => 'Consulta Medica', 'price' => 15000, 'exempt' => true],
            ['desc' => 'Insumos Varios', 'price' => 5000, 'exempt' => false]
        ]
    ],
    [
        'type' => 41, // Boleta Exenta
        'receptor' => $patient,
        'items' => [
            ['desc' => 'Sesion Kinesiologia', 'price' => 25000, 'exempt' => true]
        ]
    ],
    [
        'type' => 33, // Factura
        'receptor' => $empresaReceptora,
        'items' => [
            ['desc' => 'Equipamiento', 'price' => 100000, 'exempt' => false]
        ]
    ]
];

foreach ($docs as $idx => $d) {
    $neto = 0; $exento = 0; $iva = 0;
    foreach($d['items'] as $item) {
        if ($item['exempt']) $exento += $item['price'];
        else {
            $neto += $item['price'];
            $iva += round($item['price'] * 0.19);
        }
    }

    $invoice = Invoice::create([
        'company_id' => $company->id,
        'branch_id' => $branch->id,
        'user_id' => $user->id,
        'patient_id' => $d['receptor']->id,
        'entity_type' => 'Patient',
        'entity_id' => $d['receptor']->id,
        'dte_type' => $d['type'],
        'dte_folio' => 500 + $idx,
        'issue_date' => now(),
        'amount_neto_clp' => $neto,
        'amount_exento_clp' => $exento,
        'amount_iva_clp' => $iva,
        'amount_total_clp' => $neto + $exento + $iva,
        'dte_status' => 'sent', // Para probar sincronización
        'payment_status' => 'paid',
        'metadata' => ['client' => ['rut' => $d['receptor']->rut, 'razonSocial' => $d['receptor']->full_name]]
    ]);

    foreach($d['items'] as $item) {
        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'description' => $item['desc'],
            'quantity' => 1,
            'unit_price_clp' => $item['price'],
            'total_gross_clp' => $item['price'],
            'total_patient_clp' => $item['price'],
            'is_exento' => $item['exempt']
        ]);
    }

    // Crear el registro DTE asociado
    $invoice->dtes()->create([
        'company_id' => $company->id,
        'branch_id' => $branch->id,
        'type' => $d['type'],
        'folio' => 500 + $idx,
        'rut_emisor' => $company->rut,
        'rut_receptor' => $d['receptor']->rut,
        'total_monto_clp' => $invoice->amount_total_clp,
        'estado_sii' => 'ENVIADO',
        'track_id' => time() + $idx,
        'xml_data' => '<xml>Dummy Data</xml>'
    ]);
}

echo "Se han generado 3 documentos de prueba con sus registros DTE.\n";
