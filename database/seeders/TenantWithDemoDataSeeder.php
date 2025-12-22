<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;


class TenantWithDemoDataSeeder extends Seeder
{
  public function run(): void
  {
    $faker = Faker::create('es_CL');
    $now   = now();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'posts.view',
            'posts.create',
            'posts.edit',
            'posts.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

    $adminRole = Role::create(['name' => 'superadmin', 'guard_name' => 'web']);
    $role2 = Role::create(['name' => 'admin', 'guard_name' => 'web']);
    $role3 = Role::create(['name' => 'user', 'guard_name' => 'web']);
    $role4 = Role::create(['name' => 'doctor', 'guard_name' => 'web']);
    $kine = Role::create(['name' => 'kine', 'guard_name' => 'web']);

    $adminRole->givePermissionTo(Permission::all());

    $company = Company::create([
        'rut' => '76387221-1',
        'business_name' => 'Move',
        'giro' => 'Servicios Integrales de Informática',
        'email' => 'contacto@moveinformatica.cl',
        'phone' => '+56939377546'
    ]);

    $company2 = Company::create([
        'rut' => '22222222-2',
        'business_name' => 'Demo',
        'giro' => 'Compañia demo',
        'email' => 'contacto@demo.cl',
        'phone' => '+56912345678'
    ]);

    $branch = Branch::create([
        'company_id' => $company['id'],
        'codigo_sucursal_sii' => 'sin codigo',
        'name' => 'Senex',
        'phone' => '+56939377546',
        'email' => 'contacto@senex.cl',
        'active' => true,
    ]);

    $branch2 = Branch::create([
        'company_id' => $company['id'],
        'codigo_sucursal_sii' => 'sin codigo',
        'name' => 'SenexSport',
        'phone' => '+56939377546',
        'email' => 'contacto@senexsport.cl',
        'active' => true,
    ]);

    $branch3 = Branch::create([
        'company_id' => $company2['id'],
        'codigo_sucursal_sii' => 'sin codigo',
        'name' => 'Branch Demo',
        'phone' => '+56939377546',
        'email' => 'contacto@senexsport.cl',
        'active' => true,
    ]);
  

    $user1 = User::create([
      'company_id' => $company['id'],
      'name' => 'Juan Andres',
      'email' => 'javt1981@gmail.com',
      'password' => Hash::make('Juan1981'),
    ]);

    // Sincronizar sucursales (borra las anteriores y deja solo las del array)
    $user1->branches()->sync([$branch->id => ['is_main' => true], $branch2->id => ['is_main' => false], $branch3->id => ['is_main' => true]]);

    // O simplemente agregar una nueva
    /* $user1->branches()->attach($branchId3); */

    $user2 = User::create([
      'company_id' => $company['id'],
      'name' => 'Demo',
      'email' => 'demo@gmail.com',
      'password' => Hash::make('demo2025'),
    ]);
    $user2->branches()->sync([$branch->id => ['is_main' => true], $branch2->id => ['is_main' => false]]);
    
    $userKine = User::create([
      'company_id' => $company['id'],
      'name' => 'Kine',
      'email' => 'kine@gmail.com',
      'password' => Hash::make('kine2025'),
    ]);
    
    $userKine->branches()->sync([$branch->id => ['is_main' => true]]);

    $user1->roles()->attach($adminRole);
    $user2->roles()->attach($role2);
    $userKine->roles()->attach($kine);


    // ============= BRANCHES & ROOMS =============
    /* $branchId = $branch->id; */

    $roomIds = [];
    foreach (['Box 1', 'Box 2', 'Box 3'] as $rName) {
      $roomIds[] = DB::table('rooms')->insertGetId([
        'branch_id' => $branch['id'],
        'name' => $rName,
        'capacity' => 1,
        'status' => 'available',
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    $branches = DB::table('branches')->where('company_id', $company['id'])->pluck('id');   

    // ============= DOCTORS (kines) =============
    // 3 kines extra
    for ($i = 0; $i < 5; $i++) {
      $number = rand(10000000, 25000000);
      $rut = $this->calculateRut($number);

      $uid = DB::table('users')->insertGetId([
        'company_id' => $company['id'],
        'name' => $faker->firstName,
        'email' => "kine{$i}@demo.test",
        'password' => Hash::make('password'),
        'created_at' => $now,
        'updated_at' => $now,
      ]);

       $doctor = Doctor::create([
        'company_id' => $company['id'],
        'user_id' => $uid,
        'name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'rut' => $rut,
         'email' => "kine{$i}@demo.test",
        'phone' => $faker->numerify('+56#########'),
        'speciality' => $faker->randomElement(['Respiratoria', 'Deportiva', 'Traumatológica']),
        'birth_date' => $faker->date(),
        'gender' => $faker->randomElement(['male', 'female', 'other','unknown']),
        'created_at' => $now,
        'updated_at' => $now
      ]);

      $randomBranchId = $faker->randomElement($branches);
       $doctor->branches()->attach($randomBranchId);
    }

     // ============= PATIENTS (50) =============
    $patientIds = [];
    for ($i = 0; $i < 50; $i++) {
       $number = rand(10000000, 25000000);
      $rut = $this->calculateRut($number);

      // 1. Creamos el paciente usando el Modelo para poder usar relaciones después
    $patient = Patient::create([
        'company_id'     => $company['id'],
        'name'           => $faker->firstName,
        'last_name'      => $faker->lastName,
        'rut'            => $rut,
        'email'          => $faker->unique()->safeEmail(),
        'phone'          => $faker->numerify('+569########'),
        'birth_date'     => $faker->date(),
        'gender'         => $faker->randomElement(['male', 'female', 'other', 'unknown']),
        'occupation'     => $faker->jobTitle,
        'marital_status' => $faker->randomElement(['single', 'married', 'divorced', 'widowed']),
        'status'         => 'active',
        'notes'          => $faker->boolean(30) ? $faker->sentence(8) : null,
        'created_at'     => $now,
        'updated_at'     => $now,
    ]);

      // 2. Vinculamos a una o varias sucursales aleatorias de esa empresa
      // Esto llenará la tabla branch_patient automáticamente
      $randomBranchId = $faker->randomElement($branches);
      
      $patient->branches()->attach($randomBranchId);
      
      // Opcional: Si quieres que algunos pacientes estén en más de una sede (Many-to-Many real)
      /* if ($faker->boolean(20)) { // 20% de probabilidad de estar en otra sede
          $otherBranch = $faker->randomElement($branches);
          $patient->branches()->syncWithoutDetaching([$otherBranch]);
      } */

       DB::table('addresses')->insertGetId([
        'addressable_type' => 'Patient',
        'addressable_id' => $patient->id,
        'type' => 'home',
        'is_primary' => true,
        'lat' => $faker->latitude,
        'lng' => $faker->longitude,
        'street' => $faker->streetName,
        'number' => $faker->buildingNumber,
        'commune_id' => 13101,
        'province_id' => 2401,
        'region_id' => 12,
        'details' => $faker->secondaryAddress,
        'country' => 'Chile',
        'created_at' => $now,
        'updated_at' => $now,
      ]);

    }

    /* for ($i = 0; $i < 50; $i++) {
      DB::table('addresses')->insertGetId([
        'addressable_type' => 'Patient',
        'addressable_id' => $patientIds[$i],
        'type' => 'home',
        'is_primary' => true,
        'lat' => $faker->latitude,
        'lng' => $faker->longitude,
        'street' => $faker->streetName,
        'number' => $faker->buildingNumber,
        'commune_id' => 13101,
        'province_id' => 2401,
        'region_id' => 12,
        'details' => $faker->secondaryAddress,
        'country' => 'Chile',
        'created_at' => $now,
        'updated_at' => $now,
      ]);
    } */
       
    // ============= SESSION TYPES =============
    // Esta es la lista de datos que proporcionaste, expandida con las claves del negocio
       $sessionTypeIds = [
            // [Name, Price, Duration, Requires Diagnosis, Discount Session Count, Requires Medical Referral, Category, Code]
            
            // BASE KINESIOLOGÍA
            ['Kinesiología General', 20000, 45, true, 1, true, 'kinesiology', 'KINE-001'],
            ['Kinesiología Respiratoria', 25000, 45, true, 1, true, 'kinesiology', 'KINE-002'],
            ['Rehabilitación Deportiva', 28000, 50, true, 1, true, 'kinesiology', 'KINE-003'],
            
            // EVALUACIONES (Actos únicos)
            ['Evaluación Inicial', 30000, 60, true, 0, true, 'evaluation', 'EVAL-001'],
            ['Reevaluación de Progreso', 15000, 30, true, 0, true, 'evaluation', 'EVAL-002'],
            
            // ESPECIALIDADES Y PROCEDIMIENTOS CORTOS
            ['Drenaje Linfático Manual', 22000, 40, true, 1, true, 'procedure', 'PROC-001'],
            ['Masoterapia', 18000, 40, false, 1, false, 'massage', 'MASS-001'],
            ['Terapia con Ondas de Choque', 38000, 30, true, 0, true, 'procedure', 'PROC-002'],
            
            // SERVICIOS EXTRAS (Costo más alto, no cubiertos por planes base)
            ['Kinesiología Domiciliaria', 35000, 60, true, 1, true, 'other', 'SERV-001'],
        ];

        foreach ($sessionTypeIds as $session) {
            $name = $session[0];
            $price = $session[1]; 
            $duration = $session[2];
            $requiresDiagnosis = $session[3];
            $discountCount = $session[4]; 
            $requiresReferral = $session[5];
            $category = $session[6]; 
            $code = $session[7]; // 👈 Usamos el código estático definido arriba

    

            $dataToInsert[] = [
                'company_id' => $company['id'],
                'name' => $name,
                'code' => $code, // 👈 Asignación directa
                'category' => $category,
                'base_price_clp' => $price,
                'duration_minutes' => $duration,
                'requires_diagnosis' => $requiresDiagnosis,
                'requires_referral' => $requiresReferral,
                
                // Si descuenta sesiones (discountCount > 0), el descuento del plan es el precio base.
                'plan_discount_clp' => ($discountCount > 0) ? $price : 0, 
                
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('session_types')->insert($dataToInsert);

    // Listo 🎉
  }

  private function calculateRut($numero)
  {
      $m = 0; $s = 1;
      for ($t = $numero; $t; $t = floor($t / 10)) {
          $s = ($s + $t % 10 * (9 - $m++ % 6)) % 11;
      }
      $dv = $s ? $s - 1 : 'K';
      return $numero . '-' . $dv;
  }
}
