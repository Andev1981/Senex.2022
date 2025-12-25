<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DteLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_lookup_invoice_by_folio_and_get_items()
    {
        // 1. Setup Data
        $company = Company::create([
            'rut' => '76.123.456-7',
            'business_name' => 'Empresa Test',
            'giro' => 'Giro Test',
            'email' => 'test@company.com',
            'phone' => '123456789',
        ]);
        
        $branch = Branch::create([
            'company_id' => $company->id,
            'name' => 'Sucursal Test',
            'phone' => '123456789',
            'email' => 'sucursal@company.com',
            'codigo_sucursal_sii' => 1,
            'active' => true,
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'testuser@company.com',
            'company_id' => $company->id,
            'password' => bcrypt('password'),
        ]);
        $patient = Patient::create([
            'company_id' => $company->id,
            'name' => 'John',
            'last_name' => 'Doe',
            'rut' => '12.345.678-9',
            'email' => 'patient@test.com',
            'status' => 'active',
        ]);
        
        // Create Invoice manually
        $invoice = Invoice::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'user_id' => $user->id,
            'patient_id' => $patient->id,
            'entity_type' => Patient::class,
            'entity_id' => $patient->id,
            'dte_type' => 33, // Factura
            'dte_folio' => 12345,
            'issue_date' => now(),
            'amount_neto_clp' => 1000,
            'amount_exento_clp' => 0,
            'amount_iva_clp' => 190,
            'amount_total_clp' => 1190,
            'dte_status' => Invoice::SII_STATUS_ACCEPTED,
        ]);

        // Create Items
        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'description' => 'Item 1',
            'quantity' => 2,
            'unit_price_clp' => 500,
            'total_gross_clp' => 1000,
            'total_patient_clp' => 1000,
            'is_exento' => false,
        ]);

        // 2. Act
        $response = $this->actingAs($user)
            ->withSession([
                'active_branch_id' => $branch->id,
                'current_company_id' => $company->id
            ])
            ->getJson("/dte/lookup/12345");

        // 3. Assert
        $response->assertStatus(200)
            ->assertJson([
                'found' => true,
                'invoice_id' => $invoice->id,
                'items' => [
                    [
                        'nombre' => 'Item 1',
                        'cantidad' => 2,
                        'precio' => 500,
                    ]
                ]
            ]);
    }
}
