<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Company;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;

class DummyDteSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'javt1981@gmail.com')->first();
        if (!$user) return;

        $company = Company::find($user->company_id);
        $branch = $user->branches->first();
        if (!$branch) return;

        $patient = Patient::first();

        // Normalizamos el RUT Emisor: Solo números, sin puntos ni DV (estándar para búsqueda técnica)
        $rutLimpio = preg_replace('/[^0-9]/', '', substr($company->rut, 0, -2));

        // 1. Crear Configuración DTE de prueba
        \App\Models\DteConfiguration::updateOrCreate(
            ['company_id' => $company->id],
            [
                'rut_empresa' => $rutLimpio,
                'ambiente' => 'homologacion',
                'certificado_path' => 'certificados/dummy.pfx',
                'certificado_password' => encrypt('password123'),
            ]
        );

        // 2. Asegurar que existan folios (CAF) con el mismo RUT normalizado
        $tipos = [33, 34, 39, 41];
        foreach($tipos as $t) {
            \App\Models\AuthorizedFolio::updateOrCreate(
                ['company_id' => $company->id, 'tipo_dte' => $t],
                [
                    'rut_emisor' => $rutLimpio, 
                    'folio_desde' => 1, 
                    'folio_hasta' => 500, 
                    'ultimo_folio_usado' => rand(10, 50), 
                    'caf_xml' => '<xml>dummy</xml>',
                    'activo' => true
                ]
            );
        }

        // 3. Crear documentos de prueba limpios
        $docs = [
            ['type' => 39, 'desc' => 'Consulta Medica', 'price' => 20000, 'exempt' => true],
            ['type' => 33, 'desc' => 'Equipamiento Salud', 'price' => 50000, 'exempt' => false],
            ['type' => 34, 'desc' => 'Insumo Exento', 'price' => 15000, 'exempt' => true]
        ];

        foreach ($docs as $idx => $d) {
            $iva = $d['exempt'] ? 0 : round($d['price'] * 0.19);
            
            $invoice = Invoice::create([
                'company_id' => $company->id,
                'branch_id' => $branch->id,
                'user_id' => $user->id,
                'patient_id' => $patient->id,
                'entity_type' => 'Patient',
                'entity_id' => $patient->id,
                'dte_type' => $d['type'],
                'dte_folio' => 900 + $idx,
                'issue_date' => now(),
                'net_amount_clp' => $d['exempt'] ? 0 : $d['price'],
                'exempt_amount_clp' => $d['exempt'] ? $d['price'] : 0,
                'vat_amount_clp' => $iva,
                'total_amount_clp' => $d['price'] + $iva,
                'dte_status' => 'sent',
                'payment_status' => 'paid',
                'metadata' => ['client' => ['rut' => $patient->rut, 'razonSocial' => $patient->full_name]]
            ]);

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'company_id' => $company->id,
                'branch_id' => $branch->id,
                'description' => $d['desc'],
                'quantity' => 1,
                'unit_price_clp' => $d['price'],
                'total_gross_clp' => $d['price'],
                'total_patient_clp' => $d['price'],
                'is_exento' => $d['exempt']
            ]);

            $invoice->dtes()->create([
                'company_id' => $company->id,
                'branch_id' => $branch->id,
                'type' => $d['type'],
                'folio' => 900 + $idx,
                'rut_emisor' => $rutLimpio,
                'rut_receptor' => $patient->rut,
                'total_amount_clp' => $invoice->total_amount_clp,
                'estado_sii' => 'ENVIADO',
                'track_id' => time() + $idx,
                'xml_data' => '<xml>Dummy</xml>'
            ]);
        }
    }
}