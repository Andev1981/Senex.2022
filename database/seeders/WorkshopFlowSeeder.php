<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Item;
use App\Models\ProductDetail;
use App\Models\ServiceDetail;
use App\Models\Insurance;
use App\Models\Agreement;
use App\Models\AgreementRule;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Doctor;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WorkshopFlowSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('rut', '76765699-8')->first();
        if (!$company) {
            $this->command->error('Empresa Senex SPA no encontrada.');
            return;
        }

        $sportBranch = $company->branches()->where('name', 'Senex Sport')->first();
        $homeBranch = $company->branches()->where('name', 'Senex Domicilio')->first();

        // 1. Categorías
        $catClinica = Category::updateOrCreate(
            ['name' => 'Servicios Clínicos', 'company_id' => $company->id],
            ['slug' => Str::slug('Servicios Clínicos')]
        );
        $catInsumos = Category::updateOrCreate(
            ['name' => 'Insumos Médicos', 'company_id' => $company->id],
            ['slug' => Str::slug('Insumos Médicos')]
        );

        // 2. Servicios
        $s1 = Item::updateOrCreate(
            ['sku' => 'KINE-CLINIC', 'company_id' => $company->id],
            ['type' => 'service', 'name' => 'Kinesiología Deportiva (Presencial)', 'category_id' => $catClinica->id, 'price' => 35000, 'is_exempt' => true, 'is_active' => true]
        );
        ServiceDetail::updateOrCreate(['item_id' => $s1->id], ['duration_minutes' => 60, 'default_doctor_commission_clp' => 12000]);

        $s2 = Item::updateOrCreate(
            ['sku' => 'KINE-HOME', 'company_id' => $company->id],
            ['type' => 'service', 'name' => 'Rehabilitación a Domicilio', 'category_id' => $catClinica->id, 'price' => 45000, 'is_exempt' => true, 'is_active' => true]
        );
        ServiceDetail::updateOrCreate(['item_id' => $s2->id], ['duration_minutes' => 60, 'default_doctor_commission_clp' => 15000]);

        // 3. Productos
        $p1 = Item::updateOrCreate(
            ['sku' => 'BAND-ELAST', 'company_id' => $company->id],
            ['type' => 'product', 'name' => 'Banda Elástica Pro', 'category_id' => $catInsumos->id, 'price' => 15000, 'is_exempt' => false, 'is_active' => true]
        );
        ProductDetail::updateOrCreate(['item_id' => $p1->id], ['stock' => 50, 'critical_stock' => 5]);

        // 4. Aseguradoras y Convenios
        $fonasa = Insurance::updateOrCreate(['name' => 'FONASA', 'company_id' => $company->id]);
        $isapre = Insurance::updateOrCreate(['name' => 'COLMENA', 'company_id' => $company->id]);

        $agreement = Agreement::updateOrCreate(
            ['name' => 'Convenio Tarifario 2026', 'company_id' => $company->id, 'insurance_id' => $isapre->id],
            ['is_active' => true, 'start_date' => now()]
        );

        AgreementRule::updateOrCreate(
            ['agreement_id' => $agreement->id, 'item_id' => $s1->id],
            [
                'gross_price_clp' => 30000,
                'patient_share_clp' => 10000,
                'insurance_share_clp' => 20000,
                'patient_percentage' => 33.3,
                'insurance_percentage' => 66.6
            ]
        );

        // 5. Proveedores
        Supplier::updateOrCreate(
            ['rut' => '77777777-7', 'company_id' => $company->id],
            ['business_name' => 'Medical Supplies Chile', 'email' => 'ventas@medsupplies.cl']
        );

        // 6. Kines (Doctores)
        $this->createKine('kine.sport@senex.cl', 'Kine Sport', 'Specialist', $company, $sportBranch, '11.111.111-1');
        $this->createKine('kine.domicilio@senex.cl', 'Kine HomeCare', 'Expert', $company, $homeBranch, '22.222.222-2');

        $this->command->info('Workshop Data Loaded Success!');
    }

    private function createKine($email, $name, $lastName, $company, $branch, $rut)
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name . ' ' . $lastName, 
                'password' => Hash::make('senex2026'), 
                'company_id' => $company->id
            ]
        );
        $user->assignRole('kine');
        $user->branches()->sync([$branch->id]);

        $doctor = Doctor::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_id' => $company->id,
                'name' => $name,
                'last_name' => $lastName,
                'email' => $email,
                'speciality' => 'Kinesiología',
                'rut' => $rut
            ]
        );

        // Vincular a la sucursal via tabla pivote branch_doctor si es necesario
        $doctor->branches()->syncWithPivotValues([$branch->id], ['status' => 'active', 'mobile_app_access' => true]);
    }
}
