<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Item;
use App\Models\Patient;
use App\Models\ProductDetail;
use App\Models\ServiceDetail;
use App\Models\User;
use App\Models\Address;
use App\Models\Agreement;
use App\Models\AgreementRule;
use App\Models\Commune;
use App\Models\Plan;
use App\Models\Insurance;
use App\Models\PatientPlan;
use App\Rules\ValidRut;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class EnterpriseMigrationSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('1. Cargando Geografía...');
        $this->call([
            RegionsTableSeeder::class,
            ProvincesTableSeeder::class,
            CommunesTableSeeder::class,
        ]);

        $faker = \fake('es_CL');
        
        $commune = Commune::where('name', 'LIKE', '%Providencia%')->first() ?? Commune::first();
        if (!$commune) { $this->command->error('No hay comunas.'); return; }

        // ---------------------------------------------------------------------
        // 1. ROLES Y EMPRESA CORE
        // ---------------------------------------------------------------------
        $this->command->info('2. Configurando Roles y Empresa...');
        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'kine']);
        Role::firstOrCreate(['name' => 'patient']);

        $company = Company::firstOrCreate(
            ['rut' => '76.123.456-K'],
            ['business_name' => 'Clínica Senex Enterprise', 'email' => 'contacto@senex.cl', 'phone' => '+56912345678', 'business_type' => 'clinical']
        );

        User::updateOrCreate(
            ['email' => 'javt1981@gmail.com'],
            ['company_id' => $company->id, 'name' => 'Admin Senex', 'password' => Hash::make('senex2026')]
        )->assignRole('superadmin');

        $branch = Branch::firstOrCreate(
            ['company_id' => $company->id, 'name' => 'Casa Matriz - Providencia'],
            ['codigo_sucursal_sii' => '1', 'active' => true, 'is_main' => true]
        );

        Address::create([
            'addressable_id' => $branch->id, 'addressable_type' => Branch::class,
            'type' => 'work', 'street' => 'Av. Providencia', 'number' => '1234',
            'commune_id' => $commune->id, 'is_primary' => true
        ]);

        // ---------------------------------------------------------------------
        // 2. CATÁLOGO Y CATEGORÍAS
        // ---------------------------------------------------------------------
        $this->command->info('3. Creando Catálogo de Servicios y Productos...');
        $catSalud = Category::create(['company_id' => $company->id, 'name' => 'Kinesiología Integral', 'slug' => 'kine-integral', 'is_active' => true]);
        
        // Servicio Base (Particular)
        $itemKine = Item::create([
            'company_id' => $company->id, 'category_id' => $catSalud->id,
            'type' => 'service', 'name' => 'Sesión Kinesiología General', 'sku' => 'SERV-KINE-001',
            'price' => 35000, // PVP Particular
            'is_exempt' => true, 'is_active' => true
        ]);
        ServiceDetail::create(['item_id' => $itemKine->id, 'duration_minutes' => 60, 'requires_diagnosis' => true]);

        // ---------------------------------------------------------------------
        // 3. LOGICA DE PLANES (AGUAS SEPARADAS)
        // ---------------------------------------------------------------------
        $this->command->info('4. Configurando Planes Internos (Packs) y Externos (Aseguradoras)...');

        // A. PLANES INTERNOS (Packs que vende la clínica)
        $pack10 = Plan::create([
            'company_id' => $company->id,
            'name' => 'Pack 10 Sesiones Kinesiología',
            'code' => 'PACK-10-KINE',
            'type' => 'internal', // 👈 Fuente de verdad: El Plan mismo
            'price' => 280000,    // Valor total del pack (28k c/u vs 35k particular)
            'valid_months' => 6,
            'is_active' => true,
            'description' => 'Pack promocional de 10 sesiones de kinesiología general.'
        ]);

        // B. PLANES EXTERNOS (Identificadores de Isapre)
        $isapreColmena = Insurance::create([
            'company_id' => $company->id, 'name' => 'ISAPRE COLMENA', 'rut' => '76.123.456-7', 'institution_type' => 'health_insurer', 'is_active' => true
        ]);

        $planColmenaGold = Plan::create([
            'company_id' => $company->id,
            'insurance_id' => $isapreColmena->id,
            'name' => 'Colmena Gold (Tramo A)',
            'code' => 'COL-GOLD',
            'type' => 'external', // 👈 Fuente de verdad: El AgreementRule
            'price' => 0,         // El precio no vive aquí, vive en el convenio
            'coverage_percentage' => 80.00,
            'is_active' => true
        ]);

        // ---------------------------------------------------------------------
        // 4. CONVENIOS (TARIFARIOS PARA PLANES EXTERNOS)
        // ---------------------------------------------------------------------
        $this->command->info('5. Definiendo Tarifarios de Convenio...');
        $agreement = Agreement::create([
            'company_id' => $company->id, 'insurance_id' => $isapreColmena->id,
            'name' => 'Convenio Colmena 2026', 'is_active' => true, 'start_date' => now()
        ]);

        // Regla específica: Para el Plan Gold, la Kine cuesta 30k (Pactado), Paciente paga 6k (Copago)
        AgreementRule::create([
            'agreement_id' => $agreement->id,
            'item_id' => $itemKine->id,
            'plan_id' => $planColmenaGold->id,
            'gross_price_clp' => 30000,    // Valor pactado con Isapre
            'patient_share_clp' => 6000,   // Copago real que paga el paciente
            'insurance_share_clp' => 24000,
            'patient_percentage' => 20,
            'insurance_percentage' => 80
        ]);

        // ---------------------------------------------------------------------
        // 5. PACIENTES Y ASIGNACIÓN DE COBERTURAS
        // ---------------------------------------------------------------------
        $this->command->info('6. Poblando Pacientes con diferentes coberturas...');

        // Paciente 1: Tiene un Pack Interno (Prepago)
        $pPack = Patient::create([
            'company_id' => $company->id, 'name' => 'Juan (Con Pack)', 'last_name' => 'Pérez',
            'rut' => ValidRut::generate(), 'email' => 'juan.pack@example.com', 'status' => 'active'
        ]);
        PatientPlan::create([
            'patient_id' => $pPack->id, 'plan_id' => $pack10->id, 'company_id' => $company->id, 'branch_id' => $branch->id,
            'status' => 'active', 'purchased_at' => now(), 'sessions_included' => 10, 'sessions_used' => 2
        ]);

        // Paciente 2: Tiene Convenio Isapre (Copago)
        $pIsapre = Patient::create([
            'company_id' => $company->id, 'name' => 'María (Isapre Gold)', 'last_name' => 'Guzmán',
            'rut' => ValidRut::generate(), 'email' => 'maria.isapre@example.com', 'status' => 'active'
        ]);
        PatientPlan::create([
            'patient_id' => $pIsapre->id, 'plan_id' => $planColmenaGold->id, 'company_id' => $company->id, 'branch_id' => $branch->id,
            'status' => 'active', 'purchased_at' => now()
        ]);

        // Paciente 3: Particular (Sin Plan)
        $pParticular = Patient::create([
            'company_id' => $company->id, 'name' => 'Pedro (Particular)', 'last_name' => 'Soto',
            'rut' => ValidRut::generate(), 'email' => 'pedro.part@example.com', 'status' => 'active'
        ]);

        // ---------------------------------------------------------------------
        // 6. PERSONAL CLÍNICO (KINES)
        // ---------------------------------------------------------------------
        $this->command->info('7. Creando Kinesiólogos y Cuentas de Acceso...');
        
        $doctorsData = [
            ['name' => 'Ricardo', 'last_name' => 'Pérez', 'specialty' => 'Traumatología'],
            ['name' => 'María Paz', 'last_name' => 'Guzmán', 'specialty' => 'Respiratorio'],
        ];

        foreach ($doctorsData as $d) {
            $uKine = User::create([
                'company_id' => $company->id,
                'name' => $d['name'] . ' ' . $d['last_name'],
                'email' => strtolower(Str::ascii($d['name'])) . '.' . strtolower(Str::ascii($d['last_name'])) . '@senex.cl',
                'password' => Hash::make('password'),
            ]);
            $uKine->assignRole('kine');
            $uKine->branches()->sync([$branch->id]);

            $doctor = Doctor::create([
                'company_id' => $company->id,
                'user_id' => $uKine->id,
                'name' => $d['name'],
                'last_name' => $d['last_name'],
                'rut' => ValidRut::generate(),
                'email' => $uKine->email,
                'speciality' => $d['specialty'],
                'is_active' => true
            ]);

            // Dirección del Kine
            Address::create([
                'addressable_id' => $doctor->id,
                'addressable_type' => Doctor::class,
                'type' => 'work',
                'street' => $faker->streetName,
                'number' => $faker->buildingNumber,
                'commune_id' => $commune->id,
                'is_primary' => true
            ]);
        }
    }
}
