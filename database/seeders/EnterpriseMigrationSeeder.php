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
            PermissionSeeder::class, // 👈 Se agregaron los permisos aquí
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

        $company = Company::updateOrCreate(
            ['rut' => '76.123.456-K'],
            [
                'business_name' => 'Clínica Senex Enterprise', 
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
        // 1.1 ADMINISTRADORES DE SISTEMA
        // ---------------------------------------------------------------------
        $this->command->info('2.1 Creando Administradores...');
        
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

        for ($i = 1; $i <= 3; $i++) {
            $admin = User::create([
                'company_id' => $company->id,
                'name' => "Administrador Clínica $i",
                'email' => "admin$i@senex.cl",
                'password' => Hash::make('password'),
                'is_active' => true
            ]);
            $admin->assignRole('admin');
            $admin->branches()->sync([$branch->id]);
        }

        // ---------------------------------------------------------------------
        // 1.2 SALAS / BOXES
        // ---------------------------------------------------------------------
        $this->command->info('2.2 Creando Boxes de Atención...');
        $rooms = [];
        for ($i = 1; $i <= 6; $i++) {
            $rooms[] = Room::create([
                'company_id' => $company->id,
                'branch_id' => $branch->id,
                'name' => "Box de Kinesiología #$i",
                'capacity' => $faker->randomElement([1, 2, 3]),
                'status' => 'active'
            ]);
        }

        // ---------------------------------------------------------------------
        // 2. CATEGORÍAS
        // ---------------------------------------------------------------------
        $this->command->info('3. Creando Categorías...');
        $categories = [];
        foreach (['Kinesiología', 'Rehabilitación', 'Masajes', 'Insumos', 'Evaluaciones'] as $catName) {
            $categories[] = Category::create([
                'company_id' => $company->id,
                'name' => $catName,
                'slug' => Str::slug($catName),
                'is_active' => true
            ]);
        }

        // ---------------------------------------------------------------------
        // 3. CATÁLOGO (50+ ITEMS)
        // ---------------------------------------------------------------------
        $this->command->info('4. Creando 50+ Items en el Catálogo...');
        $services = [];
        for ($i = 1; $i <= 30; $i++) {
            $item = Item::create([
                'company_id' => $company->id,
                'category_id' => $categories[array_rand($categories)]->id,
                'type' => 'service',
                'name' => "Servicio Especializado #$i",
                'sku' => "SERV-SPEC-" . str_pad($i, 3, '0', STR_PAD_LEFT),
                'price' => $faker->randomElement([25000, 30000, 35000, 45000, 60000]),
                'is_exempt' => true,
                'is_active' => true
            ]);
            ServiceDetail::create([
                'item_id' => $item->id,
                'duration_minutes' => $faker->randomElement([30, 45, 60, 90]),
                'requires_diagnosis' => $faker->boolean(70)
            ]);
            $services[] = $item;
        }

        for ($i = 1; $i <= 25; $i++) {
            $item = Item::create([
                'company_id' => $company->id,
                'category_id' => $categories[3]->id,
                'type' => 'product',
                'name' => "Producto Clínico #$i",
                'sku' => "PROD-CLN-" . str_pad($i, 3, '0', STR_PAD_LEFT),
                'price' => $faker->numberBetween(5000, 50000),
                'is_exempt' => false,
                'is_active' => true
            ]);
            ProductDetail::create([
                'item_id' => $item->id,
                'stock' => $faker->numberBetween(10, 100),
                'manage_stock' => true
            ]);
        }

        // ---------------------------------------------------------------------
        // 4. PACKS COMERCIALES (50+ PACKS)
        // ---------------------------------------------------------------------
        $this->command->info('5. Creando 50+ Packs Comerciales...');
        for ($i = 1; $i <= 50; $i++) {
            $pack = Plan::create([
                'company_id' => $company->id,
                'name' => "Pack Promocional #$i",
                'code' => "PACK-PROMO-" . str_pad($i, 3, '0', STR_PAD_LEFT),
                'type' => 'internal',
                'price' => $faker->numberBetween(100000, 500000),
                'valid_months' => $faker->randomElement([3, 6, 12]),
                'is_active' => true,
                'description' => "Descripción para el pack promocional número $i."
            ]);
            
            $randomItems = collect($services)->random(rand(1, 3));
            foreach ($randomItems as $rItem) {
                $pack->items()->attach($rItem->id, ['max_sessions' => $faker->randomElement([5, 10, 12, 20])]);
            }
        }

        // ---------------------------------------------------------------------
        // 5. ASEGURADORAS Y NIVELES
        // ---------------------------------------------------------------------
        $this->command->info('6. Configurando Aseguradoras y 50+ Niveles de Cobertura...');
        $insurances = [];
        foreach (['COLMENA', 'CRUZ BLANCA', 'BANMEDICA', 'CONSALUD', 'FONASA', 'VIDA TRES', 'ESENCIAL'] as $insName) {
            $insurances[] = Insurance::create([
                'company_id' => $company->id,
                'name' => "ISAPRE $insName",
                'rut' => ValidRut::generate(),
                'institution_type' => 'health_insurer',
                'is_active' => true
            ]);
        }

        foreach ($insurances as $ins) {
            for ($i = 1; $i <= 8; $i++) {
                Plan::create([
                    'company_id' => $company->id,
                    'insurance_id' => $ins->id,
                    'name' => "Nivel " . $faker->colorName . " #$i",
                    'code' => strtoupper(substr($ins->name, 7, 3)) . "-LVL-$i",
                    'type' => 'external',
                    'is_active' => true
                ]);
            }

            Agreement::create([
                'company_id' => $company->id,
                'insurance_id' => $ins->id,
                'name' => "Tarifario Maestro - {$ins->name}",
                'is_active' => true,
                'start_date' => now(),
            ]);
        }

        // ---------------------------------------------------------------------
        // 5.1 ALERGIAS Y CONDICIONES BASE
        // ---------------------------------------------------------------------
        $this->command->info('6.1 Creando Catálogo de Alergias y Condiciones...');
        $allergyList = ['Penicilina', 'Látex', 'Polen', 'Frutos Secos', 'Aspirina'];
        $conditionList = ['Hipertensión', 'Diabetes Tipo 2', 'Asma', 'Hipotiroidismo', 'Escoliosis'];
        
        $allergies = [];
        foreach ($allergyList as $a) $allergies[] = Allergy::create(['name' => $a, 'code' => strtoupper(substr($a, 0, 3))]);
        
        $conditions = [];
        foreach ($conditionList as $c) $conditions[] = Condition::create(['name' => $c, 'icd10' => $faker->bothify('??##')]);

        // ---------------------------------------------------------------------
        // 6. PACIENTES (100+ PACIENTES CON DATA CLÍNICA)
        // ---------------------------------------------------------------------
        $this->command->info('7. Creando 100+ Pacientes con Fichas Clínicas...');
        $allPlans = Plan::all();
        $allCommunes = Commune::limit(100)->get();

        for ($i = 1; $i <= 100; $i++) {
            $patient = Patient::create([
                'company_id' => $company->id,
                'name' => $faker->firstName,
                'last_name' => $faker->lastName . ' ' . $faker->lastName,
                'rut' => ValidRut::generate(),
                'email' => "patient$i@example.com",
                'phone' => '+569' . $faker->randomNumber(8, true),
                'birth_date' => $faker->date('Y-m-d', '-18 years'),
                'gender' => $faker->randomElement(['male', 'female', 'other']),
                'status' => 'active'
            ]);

            // VINCULAR PACIENTE A LA SUCURSAL
            $patient->branches()->sync([$branch->id => ['status' => 'active']]);

            if ($faker->boolean(80)) {
                $randomPlan = $allPlans->random();
                PatientPlan::create([
                    'patient_id' => $patient->id,
                    'plan_id' => $randomPlan->id,
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'status' => 'active',
                    'purchased_at' => now()->subDays(rand(1, 60)),
                    'sessions_included' => $randomPlan->type === 'internal' ? 10 : null,
                    'sessions_used' => 0
                ]);
            }

            Address::create([
                'addressable_id' => $patient->id, 'addressable_type' => Patient::class,
                'type' => 'home', 'street' => $faker->streetName, 'number' => $faker->buildingNumber,
                'commune_id' => $allCommunes->random()->id, 'is_primary' => true
            ]);

            PatientContact::create([
                'patient_id' => $patient->id,
                'name' => $faker->name,
                'relationship' => $faker->randomElement(['Pareja', 'Padre', 'Madre', 'Hijo/a']),
                'phone' => '+569' . $faker->randomNumber(8, true),
                'is_primary' => true
            ]);

            for ($v = 0; $v < 2; $v++) {
                VitalSign::create([
                    'company_id' => $company->id,
                    'patient_id' => $patient->id,
                    'recorded_at' => now()->subDays(rand(1, 30)),
                    'source_type' => 'manual', 
                    'source_id' => $superAdmin->id,
                    'recorded_by_user_id' => $superAdmin->id,
                    'bp_systolic' => $faker->numberBetween(110, 140),
                    'bp_diastolic' => $faker->numberBetween(70, 90),
                    'heart_rate' => $faker->numberBetween(60, 100),
                    'resp_rate' => $faker->numberBetween(12, 20),
                    'spo2' => $faker->numberBetween(95, 100),
                    'temperature_c' => $faker->randomFloat(1, 36, 37.5),
                    'height_cm' => $faker->numberBetween(150, 190),
                    'weight_kg' => $faker->numberBetween(50, 100),
                ]);
            }

            MedicalHistory::create([
                'company_id' => $company->id,
                'patient_id' => $patient->id,
                'recorded_by_user_id' => $superAdmin->id,
                'pathologies' => $faker->boolean(30) ? $faker->sentence : null,
                'surgeries' => $faker->boolean(20) ? $faker->sentence : null,
                'medications' => $faker->boolean(40) ? $faker->sentence : null,
                'blood_type' => $faker->randomElement(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']),
                'handedness' => $faker->randomElement(['right', 'left', 'ambidextrous']),
            ]);

            if ($faker->boolean(20)) {
                PatientAllergy::create([
                    'patient_id' => $patient->id,
                    'allergy_id' => $allergies[array_rand($allergies)]->id,
                    'severity' => $faker->randomElement(['mild', 'moderate', 'severe'])
                ]);
            }
            if ($faker->boolean(30)) {
                PatientCondition::create([
                    'patient_id' => $patient->id,
                    'condition_id' => $conditions[array_rand($conditions)]->id,
                    'active' => true
                ]);
            }
        }

        // ---------------------------------------------------------------------
        // 7. KINESIÓLOGOS (30+ DOCTORES CON TURNOS)
        // ---------------------------------------------------------------------
        $this->command->info('8. Creando 30+ Kinesiólogos con Turnos (Disponibilidad)...');
        for ($i = 1; $i <= 30; $i++) {
            $name = $faker->name;
            $uKine = User::create([
                'company_id' => $company->id,
                'name' => $name,
                'email' => "kine$i@senex.cl",
                'password' => Hash::make('password'),
                'is_active' => true
            ]);
            $uKine->assignRole('kine');
            $uKine->branches()->sync([$branch->id]);

            $doctor = Doctor::create([
                'company_id' => $company->id,
                'user_id' => $uKine->id,
                'name' => $faker->firstName,
                'last_name' => $faker->lastName,
                'rut' => ValidRut::generate(),
                'email' => $uKine->email,
                'is_active' => true
            ]);

            // VINCULAR DOCTOR A LA SUCURSAL (CRÍTICO)
            $doctor->branches()->sync([$branch->id => ['status' => 'active']]);

            // CREAR DISPONIBILIDAD (Turnos para que aparezcan en la agenda)
            Availability::create([
                'company_id' => $company->id,
                'branch_id' => $branch->id,
                'doctor_id' => $doctor->id,
                'room_id' => $rooms[array_rand($rooms)]->id,
                'rrule' => 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
                'start_time' => '09:00:00',
                'end_time' => '18:00:00',
                'lunch_start_time' => '13:00:00',
                'lunch_end_time' => '14:00:00',
                'valid_from' => now()->subMonth(),
                'is_active' => true,
                'modality' => 'onsite'
            ]);
        }
        
        $this->command->info('✅ Carga Masiva Completa con Visibilidad Garantizada.');
    }
}
