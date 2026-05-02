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
        // 3. PILAR A: PACKS & PROGRAMAS (PRODUCTO INTERNO)
        // ---------------------------------------------------------------------
        $this->command->info('4. Configurando Packs & Programas (Venta Directa)...');

        $pack10 = Plan::create([
            'company_id' => $company->id,
            'name' => 'Pack 10 Sesiones Kinesiología',
            'code' => 'PACK-10-KINE',
            'type' => 'internal', 
            'price' => 280000,    
            'valid_months' => 6,
            'is_active' => true,
            'description' => 'Pack promocional de 10 sesiones.'
        ]);
        // Vincular el pack al item
        $pack10->items()->attach($itemKine->id, ['max_sessions' => 10]);

        // ---------------------------------------------------------------------
        // 4. PILAR B: ASEGURADORAS & NIVELES (IDENTIFICADORES)
        // ---------------------------------------------------------------------
        $this->command->info('5. Configurando Aseguradoras y Niveles de Cobertura...');

        $isapreColmena = Insurance::create([
            'company_id' => $company->id, 'name' => 'ISAPRE COLMENA', 'rut' => '76.123.456-7', 'institution_type' => 'health_insurer', 'is_active' => true
        ]);

        $nivelColmenaGold = Plan::create([
            'company_id' => $company->id,
            'insurance_id' => $isapreColmena->id,
            'name' => 'Colmena Gold',
            'code' => 'COL-GOLD',
            'type' => 'external', 
            'price' => null, // $0 en tabla plans para externos
            'coverage_percentage' => 80.00,
            'is_active' => true
        ]);

        // ---------------------------------------------------------------------
        // 5. PILAR C: TARIFARIO MAESTRO (CONVENIOS REALES)
        // ---------------------------------------------------------------------
        $this->command->info('6. Definiendo Tarifario Maestro (Fuente de Verdad Isapre)...');
        $agreement = Agreement::create([
            'company_id' => $company->id, 'insurance_id' => $isapreColmena->id,
            'name' => 'Tarifario Colmena 2026', 'is_active' => true, 'start_date' => now()
        ]);

        // REGLA: [Aseguradora] + [Nivel Gold] + [Servicio Kine] = $30.000 Pactado ($6.000 Copago)
        AgreementRule::create([
            'agreement_id' => $agreement->id,
            'item_id' => $itemKine->id,
            'plan_id' => $nivelColmenaGold->id,
            'gross_price_clp' => 30000,
            'patient_share_clp' => 6000,
            'insurance_share_clp' => 24000,
            'patient_percentage' => 20,
            'insurance_percentage' => 80
        ]);

        // ---------------------------------------------------------------------
        // 6. PACIENTES CON DIFERENTES ESTRATEGIAS DE PAGO
        // ---------------------------------------------------------------------
        $this->command->info('7. Creando Pacientes con diversas estrategias de pago...');

        // Caso 1: Paciente con PACK PREPAGADO
        $pPack = Patient::create([
            'company_id' => $company->id, 'name' => 'Alberto (Pack 10)', 'last_name' => 'Vargas',
            'rut' => ValidRut::generate(), 'email' => 'vargas@example.com', 'status' => 'active'
        ]);
        PatientPlan::create([
            'patient_id' => $pPack->id, 'plan_id' => $pack10->id, 'company_id' => $company->id, 'branch_id' => $branch->id,
            'status' => 'active', 'purchased_at' => now(), 'sessions_included' => 10, 'sessions_used' => 0
        ]);

        // Caso 2: Paciente con ISAPRE (Copago)
        $pIsapre = Patient::create([
            'company_id' => $company->id, 'name' => 'Lucía (Colmena Gold)', 'last_name' => 'Rivas',
            'rut' => ValidRut::generate(), 'email' => 'rivas@example.com', 'status' => 'active'
        ]);
        PatientPlan::create([
            'patient_id' => $pIsapre->id, 'plan_id' => $nivelColmenaGold->id, 'company_id' => $company->id, 'branch_id' => $branch->id,
            'status' => 'active', 'purchased_at' => now()
        ]);

        // Caso 3: Paciente Particular
        Patient::create([
            'company_id' => $company->id, 'name' => 'Tomás (Particular)', 'last_name' => 'Díaz',
            'rut' => ValidRut::generate(), 'email' => 'diaz@example.com', 'status' => 'active'
        ]);

        // ---------------------------------------------------------------------
        // 7. PERSONAL CLÍNICO
        // ---------------------------------------------------------------------
        foreach (['Ricardo Pérez', 'María Paz Guzmán'] as $name) {
            $parts = explode(' ', $name);
            $uKine = User::create([
                'company_id' => $company->id, 'name' => $name, 'email' => strtolower($parts[0]).'@senex.cl', 'password' => Hash::make('password'),
            ]);
            $uKine->assignRole('kine');
            $uKine->branches()->sync([$branch->id]);

            Doctor::create([
                'company_id' => $company->id, 'user_id' => $uKine->id, 'name' => $parts[0], 'last_name' => $parts[1],
                'rut' => ValidRut::generate(), 'email' => $uKine->email, 'is_active' => true
            ]);
        }
    }
}
