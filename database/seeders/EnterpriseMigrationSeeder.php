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
use App\Models\Province;
use App\Models\Region;
use App\Models\Plan;
use App\Models\Insurance;
use App\Models\PatientPlan;
use App\Models\Room;
use App\Models\Allergy;
use App\Models\Condition;
use App\Models\VitalSign;
use App\Models\MedicalHistory;
use App\Models\PatientContact;
use App\Models\PatientAllergy;
use App\Models\PatientCondition;
use App\Models\Availability;
use App\Models\Image;
use App\Rules\ValidRut;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class EnterpriseMigrationSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('1. Cargando Geografía y Permisos...');
        $this->call([
            RegionsTableSeeder::class,
            ProvincesTableSeeder::class,
            CommunesTableSeeder::class,
            PermissionSeeder::class,
        ]);

        $faker = \fake('es_CL');
        
        // Determinar IDs por defecto (RM, Santiago, Las Condes)
        $rmId = Region::where('name', 'LIKE', '%Metropolitana%')->value('id') ?? 13;
        $santiagoId = Province::where('name', 'LIKE', '%Santiago%')->value('id') ?? 2401;
        $lasCondesId = Commune::where('name', 'LIKE', '%Condes%')->value('id') ?? 13114;

        // ---------------------------------------------------------------------
        // 1. EMPRESA CORE (SENEX)
        // ---------------------------------------------------------------------
        $this->command->info('2. Configurando Empresa Senex...');
        
        $company = Company::updateOrCreate(
            ['rut' => '76.123.456-K'],
            [
                'business_name' => 'Clínica Senex', 
                'email' => 'contacto@senex.cl', 
                'phone' => '+56912345678', 
                'business_type' => 'clinical',
                'enabled_modules' => ['clinical_management', 'commercial_management', 'finance_admin', 'system_config']
            ]
        );

        // AGREGAR LOGO A LA COMPAÑÍA
        $company->logo()->updateOrCreate(
            ['type' => 'logo'],
            [
                'path' => 'https://api.dicebear.com/7.x/initials/svg?seed=CS&backgroundColor=21235b&textColor=ffffff',
                'url'  => 'https://api.dicebear.com/7.x/initials/svg?seed=CS&backgroundColor=21235b&textColor=ffffff'
            ]
        );

        // UNICA SUCURSAL: Chesterton
        $branch = Branch::updateOrCreate(
            ['company_id' => $company->id, 'name' => 'Chesterton'],
            [
                'codigo_sucursal_sii' => '0', 
                'active' => true, 
                'is_main' => true,
                'email' => 'chesterton@senex.cl',
                'phone' => '+56912345678'
            ]
        );

        Address::updateOrCreate(
            ['addressable_id' => $branch->id, 'addressable_type' => Branch::class],
            [
                'type' => 'work', 
                'street' => 'Chesterton', 
                'number' => '7595',
                'commune_id' => $lasCondesId, 
                'province_id' => $santiagoId,
                'region_id' => $rmId,
                'is_primary' => true
            ]
        );

        // ---------------------------------------------------------------------
        // 1.1 ADMINISTRADORES INICIALES
        // ---------------------------------------------------------------------
        $this->command->info('2.1 Creando Administradores Iniciales...');
        
        // Superadmin Maestro
        $superAdmin = User::updateOrCreate(
            ['email' => 'javt1981@gmail.com'],
            [
                'company_id' => $company->id, 
                'name' => 'Admin Maestro Senex', 
                'password' => Hash::make('senex2026'),
                'is_active' => true
            ]
        );
        $superAdmin->syncRoles(['superadmin']);
        $superAdmin->branches()->sync([$branch->id => ['is_main' => true]]);

        // Admin Inicial
        $admin = User::updateOrCreate(
            ['email' => 'admin@senex.cl'],
            [
                'company_id' => $company->id,
                'name' => "Administrador Senex",
                'password' => Hash::make('password'),
                'is_active' => true
            ]
        );
        $admin->syncRoles(['admin']);
        $admin->branches()->sync([$branch->id]);

        // ---------------------------------------------------------------------
        // 1.2 SALAS / BOXES
        // ---------------------------------------------------------------------
        $this->command->info('2.2 Creando Boxes en Chesterton...');
        $rooms = [];
        for ($i = 1; $i <= 4; $i++) {
            $rooms[] = Room::updateOrCreate(
                ['company_id' => $company->id, 'branch_id' => $branch->id, 'name' => "Box #$i"],
                ['capacity' => 1, 'status' => 'active']
            );
        }

        // ---------------------------------------------------------------------
        // 2. CATEGORÍAS Y SERVICIOS BASE
        // ---------------------------------------------------------------------
        $this->command->info('3. Creando Servicios Base...');
        $cat = Category::updateOrCreate(
            ['company_id' => $company->id, 'name' => 'Kinesiología'],
            ['slug' => 'kinesiologia', 'is_active' => true]
        );

        $service = Item::updateOrCreate(
            ['company_id' => $company->id, 'sku' => 'SERV-KINE-001'],
            [
                'category_id' => $cat->id,
                'type' => 'service',
                'name' => "Sesión de Kinesiología Integral",
                'price' => 35000,
                'is_exempt' => true,
                'is_active' => true
            ]
        );
        ServiceDetail::updateOrCreate(['item_id' => $service->id], ['duration_minutes' => 45]);

        // ---------------------------------------------------------------------
        // 3. PACKS COMERCIALES INICIALES
        // ---------------------------------------------------------------------
        $this->command->info('4. Creando Packs Iniciales...');
        $pack = Plan::updateOrCreate(
            ['company_id' => $company->id, 'code' => 'PACK-10-KINE'],
            [
                'name' => "Pack 10 Sesiones Kinesiología",
                'type' => 'internal',
                'price' => 280000,
                'valid_months' => 6,
                'is_active' => true,
                'description' => "Programa de rehabilitación integral de 10 sesiones."
            ]
        );
        $pack->items()->sync([$service->id => ['max_sessions' => 10]]);

        $this->command->info('✅ Limpieza y Seteo Senex completado.');
    }
}
