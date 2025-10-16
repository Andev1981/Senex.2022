<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;


class TenantWithDemoDataSeeder extends Seeder
{
  public function run(): void
  {
    $faker = Faker::create('es_CL');
    $now   = now();


    $role = Role::create(['name' => 'superadmin', 'guard_name' => 'web']);
    $role2 = Role::create(['name' => 'admin_user', 'guard_name' => 'web']);
    $role3 = Role::create(['name' => 'admin_client', 'guard_name' => 'web']);
    $role4 = Role::create(['name' => 'client', 'guard_name' => 'web']);
    $role5 = Role::create(['name' => 'coordinator', 'guard_name' => 'web']);
    $role6 = Role::create(['name' => 'evaluator', 'guard_name' => 'web']);

    $user = User::create([
      'name' => 'Juan Andres',
      'last_name' => 'Vergara Tapia',
      'email' => 'javt1981@gmail.com',
      'password' => Hash::make('Juan1981'),
    ]);

    $user = User::create([
      'name' => 'Demo',
      'last_name' => 'User',
      'email' => 'demo@gmail.com',
      'password' => Hash::make('demo2025'),
    ]);

    $user->roles()->attach($role);

    // ============= BRANCHES & ROOMS =============
    $branchId = DB::table('branches')->insertGetId([

      'name' => 'Casa Matriz',
      'created_at' => $now,
      'updated_at' => $now
    ]);
    $roomIds = [];
    foreach (['Box 1', 'Box 2', 'Box 3'] as $rName) {
      $roomIds[] = DB::table('rooms')->insertGetId([

        'branch_id' => $branchId,
        'name' => $rName,
        'capacity' => 1,
        'status' => 'available',
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    // ============= DOCTORS (kines) =============
    $doctorIds = [];
    // Kine principal ligado al user kine@demo.test
    $doctorIds[] = DB::table('doctors')->insertGetId([

      'user_id' => $user['id'],
      'branch_id' => $branchId,
      'name' => 'Kine',
      'last_name' => 'Demo',
      'rut' => null,
      'specialty' => 'Kinesiología Deportiva',
      'is_active' => 1,
      'created_at' => $now,
      'updated_at' => $now
    ]);
    // 3 kines extra
    for ($i = 0; $i < 3; $i++) {
      $uid = DB::table('users')->insertGetId([
        'name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'email' => "kine{$i}@demo.test",
        'password' => Hash::make('password'),
        'created_at' => $now,
        'updated_at' => $now,
      ]);

      $doctorIds[] = DB::table('doctors')->insertGetId([

        'user_id' => $uid,
        'branch_id' => $branchId,
        'name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'rut' => null,
        'specialty' => $faker->randomElement(['Respiratoria', 'Deportiva', 'Traumatológica']),
        'is_active' => 1,
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    // ============= PATIENTS (50) =============
    $patientIds = [];
    for ($i = 0; $i < 50; $i++) {
      $patientIds[] = DB::table('patients')->insertGetId([

        'name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'rut' => null,
        'email' => $faker->unique()->safeEmail(),
        'phone' => $faker->phoneNumber,
        'birth_date' => $faker->date(),
        'gender' => $faker->randomElement(['male', 'female', 'other']),
        'notes' => $faker->boolean(30) ? $faker->sentence(8) : null,
        'created_at' => $now,
        'updated_at' => $now,
      ]);
    }

    // ============= SESSION TYPES =============
    $sessionTypeRows = [
      ['Kinesiología General', 20000, 45, true, 1],
      ['Kinesiología Respiratoria', 25000, 45, true, 1],
      ['Masoterapia', 18000, 40, true, 1],
      ['Evaluación Inicial', 30000, 60, false, 0],
      ['Rehabilitación Deportiva', 28000, 50, true, 1],
    ];
    $sessionTypeIds = [];
    foreach ($sessionTypeRows as [$name, $price, $mins, $planEligible, $planVal]) {
      $sessionTypeIds[] = DB::table('session_types')->insertGetId([

        'name' => $name,
        'base_price' => $price,
        'duration_minutes' => $mins,
        'plan_eligible' => $planEligible,
        'plan_session_value' => $planVal,
        'active' => 1,
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    // ============= COMMISSIONS (por kines x tipo) =============
    foreach ($doctorIds as $did) {
      foreach ($sessionTypeIds as $sid) {
        DB::table('doctor_commission_rates')->insert([

          'doctor_id' => $did,
          'session_type_id' => $sid,
          'commission_type' => $faker->randomElement(['percentage', 'fixed_amount']),
          'commission_value' => $faker->randomElement([50, 55, 60, 65, 15000, 18000]),
          'effective_from' => Carbon::now()->subMonths(2)->toDateString(),
          'effective_until' => null,
          'is_active' => 1,
          'notes' => null,
          'created_at' => $now,
          'updated_at' => $now
        ]);
      }
    }



    // ============= AVAILABILITIES (turnos) =============
    foreach ($doctorIds as $did) {
      DB::table('availabilities')->insert([
        'doctor_id'   => $did,
        'timezone'    => 'America/Santiago',
        'rrule'       => 'FREQ=WEEKLY;BYDAY=MO,TU,TH', // sin BYHOUR
        'start_time'  => '09:00:00',
        'end_time'    => '18:00:00',
        'valid_from'  => now()->subWeeks(2)->toDateString(),
        'valid_until' => null,
        'is_active'   => 1,
        'meta'        => json_encode([]),
        'created_at'  => $now,
        'updated_at'  => $now,
      ]);
    }

    // ============= PLANS (prepago) =============
    $planIds = [];
    $planIds[] = DB::table('plans')->insertGetId([

      'name' => 'Plan 10 Sesiones',
      'type' => 'session_pack',
      'total_sessions' => 10,
      'price' => 180000,
      'valid_months' => 12,
      'session_types' => json_encode($sessionTypeIds),
      'is_active' => 1,
      'created_at' => $now,
      'updated_at' => $now
    ]);
    $planIds[] = DB::table('plans')->insertGetId([
      'name' => 'Plan Anual 50 Sesiones',
      'type' => 'annual',
      'total_sessions' => 50,
      'price' => 750000,
      'valid_months' => 12,
      'session_types' => json_encode([$sessionTypeIds[0], $sessionTypeIds[1], $sessionTypeIds[4]]),
      'is_active' => 1,
      'created_at' => $now,
      'updated_at' => $now
    ]);
    $planIds[] = DB::table('plans')->insertGetId([
      'name' => 'Plan Ilimitado Mensual',
      'type' => 'unlimited',
      'total_sessions' => null,
      'price' => 120000,
      'valid_months' => 1,
      'session_types' => json_encode([$sessionTypeIds[0], $sessionTypeIds[2]]),
      'is_active' => 1,
      'created_at' => $now,
      'updated_at' => $now
    ]);

    // Precarga planes para evitar 3 queries por iteración
    $planRows = DB::table('plans')
      ->whereIn('id', $planIds)
      ->get(['id', 'price', 'total_sessions', 'valid_months'])
      ->keyBy('id');

    // Helper para obtener datos de plan rápidamente
    $getPlan = function ($id) use ($planRows) {
      $p = $planRows->get($id);
      return [
        'price'          => (int) round($p->price ?? 0),          // CLP sin centavos
        'total_sessions' => (int) ($p->total_sessions ?? 0),
        'valid_months'   => (int) ($p->valid_months ?? 12),
      ];
    };

    // ============= PATIENT PLANS (a ~10 pacientes) =============
    $assignedPlans = [];
    foreach (array_slice($patientIds, 0, 10) as $pid) {
      $planId      = $faker->randomElement($planIds);
      $plan        = $planRows->get($planId);
      $purchasedAt = Carbon::now()->subDays($faker->numberBetween(1, 60));
      $validMonths = (int) ($plan->valid_months ?? 12);
      $expiry      = (clone $purchasedAt)->addMonths($validMonths)->toDateString();

      // CLP entero (sin centavos)
      $amountClp = (int) round($plan->price ?? 0);

      // ===== SOLO payments (según tu migración) =====
      $paymentId = DB::table('payments')->insertGetId([
        'patient_id'            => $pid,
        'treatment_id'          => null,                // compra de plan, no ligada a tratamiento específico
        'treatment_session_id'  => null,                // tampoco a una sesión en particular
        'date'                  => $purchasedAt->toDateString(),
        'concept'               => 'Compra de plan: ' . ($plan->name ?? 'Plan'),
        'amount_clp'            => $amountClp,          // total cobrado en CLP
        'copay_clp'             => 0,                   // si todo lo paga el paciente, puedes dejar 0 aquí
        'insurance_covered_clp' => 0,                   // y 0 para cobertura (ajusta si simulas seguros)
        'payment_method'        => $faker->randomElement(['webpay', 'cash', 'transfer', 'insurance', 'other']),
        'status'                => 'completed',         // completado al momento de la compra
        'paid_at'               => $purchasedAt,        // fecha/hora de pago
        'invoice'               => null,                // o genera uno único si quieres probar la unique()
        'notes'                 => null,
        'created_at'            => $purchasedAt,
        'updated_at'            => $purchasedAt,
      ]);

      // ---- resto de tu seeding (si lo mantienes) ----
      $assignedPlans[$pid] = DB::table('patient_plans')->insertGetId([
        'patient_id'         => $pid,
        'plan_id'            => $planId,
        'purchased_at'       => $purchasedAt,
        'expiry_date'        => $expiry,
        'sessions_included'  => (int) ($plan->total_sessions ?? 0),
        'sessions_used'      => 0,
        'status'             => 'active',
        'payment_id' => $paymentId, // si tu FK aquí se llama distinto (p.ej. payment_id), ajústalo
        'created_at'         => $purchasedAt,
        'updated_at'         => $purchasedAt,
      ]);
    }

    // ============= APPOINTMENTS (hoy y proximos días) =============
    $apptIds = [];
    foreach (range(0, 2) as $d) { // hoy + 2 días
      foreach ($doctorIds as $did) {
        foreach (range(0, 4) as $slot) {
          $start = Carbon::today('America/Santiago')->addDays($d)->setTime(9 + $slot * 2, 0);
          $end   = (clone $start)->addMinutes(45);
          $patientId = $faker->randomElement($patientIds);
          $room = $faker->randomElement($roomIds);

          $apptIds[] = DB::table('appointments')->insertGetId([
            'patient_id' => $patientId,
            'doctor_id' => $did,
            'room_id' => $room,
            'start_at' => $start,
            'end_at' => $end,
            'status' => $faker->randomElement(['scheduled', 'scheduled', 'scheduled', 'checked_in']),
            'check_in_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'notes' => null,
            'meta' => json_encode([]),
            'created_at' => $now,
            'updated_at' => $now,
          ]);
        }
      }
    }

    // ============= TREATMENTS (20) =============
    $treatmentIds = [];

    for ($i = 0; $i < 20; $i++) {
      $patientId  = $faker->randomElement($patientIds);
      $doctorId   = $faker->optional(0.25)->randomElement($doctorIds); // 25% null
      $stypeId    = $faker->randomElement($sessionTypeIds);            // obligatorio

      $startDate  = Carbon::now()->subDays($faker->numberBetween(5, 40))->startOfDay();
      $status     = $faker->randomElement(['Activo', 'Completado', 'Suspendido']);

      // total_sessions (tinyint). Mantén un rango razonable para kinesiología
      $totalSessions = $faker->numberBetween(6, 20);

      // completed_sessions consistente con status
      if ($status === 'Completado') {
        $completedSessions = $totalSessions;
      } elseif ($status === 'Suspendido') {
        $completedSessions = $faker->numberBetween(0, max(0, $totalSessions - 1));
      } else { // Activo
        $completedSessions = $faker->numberBetween(0, $totalSessions);
      }

      // end_date / outcome / next_appointment coherentes
      $endDate = null;
      $outcome = null;
      if ($status === 'Completado') {
        // fin entre 1 y 4 semanas después del inicio
        $endDate = (clone $startDate)->addWeeks($faker->numberBetween(1, 4))->toDateString();
        $outcome = $faker->sentence(12);
      }

      $nextAppointment = null;
      if ($status !== 'Completado' && $faker->boolean(70)) {
        // próxima cita dentro de los próximos 3–14 días a las 10:00
        $nextAppointment = Carbon::now()
          ->addDays($faker->numberBetween(3, 14))
          ->setTime(10, 0, 0)
          ->toDateTimeString();
      }

      // diagnosis obligatorio, description opcional
      $diagnosis   = Str::limit($faker->sentence(6), 255, ''); // string corto
      $description = $faker->optional(0.7)->paragraph();

      // name (<=150)
      $name = Str::limit($faker->sentence($faker->numberBetween(3, 7)), 150, '');

      // frequency / current_phase / objectives (JSON)
      $frequency    = $faker->randomElement(['1/semana', '2/semana', '3/semana', null]);
      $currentPhase = $faker->randomElement(['Evaluación', 'Tratamiento', 'Rehabilitación', 'Alta', null]);

      $objectivesArr = $faker->randomElements([
        'Reducir dolor',
        'Mejorar movilidad',
        'Fortalecer zona lumbar',
        'Recuperar rango articular',
        'Reeducación postural',
      ], $faker->numberBetween(1, 3));

      $treatmentIds[] = DB::table('treatments')->insertGetId([
        'session_type_id'     => $stypeId,
        'patient_id'          => $patientId,
        'doctor_id'           => $doctorId, // nullable
        'name'                => $name,
        'diagnosis'           => $diagnosis,
        'description'         => $description,
        'start_date'          => $startDate->toDateString(),
        'end_date'            => $endDate,
        'status'              => $status,
        'total_sessions'      => $totalSessions,
        'completed_sessions'  => $completedSessions,
        'frequency'           => $frequency,
        'current_phase'       => $currentPhase,
        'objectives'          => json_encode(array_values($objectivesArr), JSON_UNESCAPED_UNICODE),
        'outcome'             => $outcome,
        'next_appointment'    => $nextAppointment,

        // KPIs (0–100; tinyint soporta hasta 255)
        'pain_reduction'      => $status === 'Completado' ? $faker->numberBetween(60, 100) : $faker->numberBetween(0, 60),
        'mobility_improvement' => $status === 'Completado' ? $faker->numberBetween(60, 100) : $faker->numberBetween(0, 60),
        'strength_gain'       => $status === 'Completado' ? $faker->numberBetween(60, 100) : $faker->numberBetween(0, 60),

        'created_at'          => $now,
        'updated_at'          => $now,
      ]);
    }

    // ============= TREATMENT SESSIONS (80+) + pagos/deudas + notas clínicas
    $tsIds = [];
    foreach (range(1, 80) as $i) {
      $tId = $faker->randomElement($treatmentIds);

      // Trae patient y doctor del tratamiento
      $tRow   = DB::table('treatments')->select('patient_id', 'doctor_id')->where('id', $tId)->first();
      $pId    = $tRow->patient_id ?? null;
      $dId    = $tRow->doctor_id ?? $faker->randomElement($doctorIds); // por si el tratamiento no tiene doctor

      // Elige tipo de sesión
      $stypeId   = $faker->randomElement($sessionTypeIds);

      // Fecha/hora de atención (ahora separados)
      $attended  = Carbon::now()->subDays($faker->numberBetween(0, 25))
        ->setTime($faker->numberBetween(9, 18), $faker->randomElement([0, 15, 30, 45]));
      $date      = $attended->toDateString();
      $time      = $attended->format('H:i:s');

      // Precio base y comisión
      $basePrice = (int) DB::table('session_types')->where('id', $stypeId)->value('base_price');

      $rate = DB::table('doctor_commission_rates')
        ->where('doctor_id', $dId)->where('session_type_id', $stypeId)
        ->orderByDesc('effective_from')->first();

      $doctorAmount = 0;
      if ($rate) {
        if ($rate->commission_type === 'percentage') {
          $doctorAmount = (int) round($basePrice * ($rate->commission_value / 100));
        } else {
          $doctorAmount = (int) round($rate->commission_value);
        }
      }
      $clinicAmount = max(0, $basePrice - $doctorAmount);


      // Insert en treatment_sessions según nueva migración
      $tsId = DB::table('treatment_sessions')->insertGetId([
        'treatment_id'          => $tId,
        'doctor_id'             => $dId,
        'patient_id'            => $pId,
        'session_type_id'       => $stypeId,
        'room_id'               => null,     // o $faker->randomElement($roomIds) si los tienes
        'branch_id'             => null,     // idem para sucursales
        'session_number'        => $faker->numberBetween(1, 12),
        'date'                  => $date,
        'time'                  => $time,
        'duration'              => 45,
        'status'                => 'Completada', // estaba "completed"
        'pain_before'           => $faker->optional(0.5)->numberBetween(0, 10),
        'pain_after'            => $faker->optional(0.5)->numberBetween(0, 10),
        'rom_flexion'           => $faker->optional(0.3)->numberBetween(0, 180),
        'rom_abduction'         => $faker->optional(0.3)->numberBetween(0, 180),
        'rom_rotation'          => $faker->optional(0.3)->numberBetween(0, 180),
        'techniques'            => $faker->boolean(30) ? json_encode([$faker->word(), $faker->word()]) : null,
        'exercises'             => $faker->boolean(30) ? json_encode([$faker->word(), $faker->word()]) : null,
        'notes'                 => $faker->boolean(20) ? $faker->sentence(8) : null,
        'homework'              => $faker->boolean(20) ? $faker->sentence(10) : null,
        'next_goals'            => $faker->boolean(20) ? $faker->sentence(10) : null,

        // Snapshot de tarifa aplicada (nuevos nombres *_clp)
        'patient_amount_clp'    => $basePrice,
        'doctor_amount_clp'     => $doctorAmount,
        'clinic_amount_clp'     => $clinicAmount,

        'created_at'            => $attended,
        'updated_at'            => $attended,
      ]);
      $tsIds[] = $tsId;

      // ¿Paciente tiene plan activo que cubra?
      $planUse = (isset($assignedPlans[$pId]) && $faker->boolean(50));
      if ($planUse) {
        DB::table('plan_session_consumptions')->insert([
          'patient_plan_id'       => $assignedPlans[$pId],
          'treatment_session_id'  => $tsId,
          'sessions_consumed'     => 1,
          'consumed_at'           => $attended,
          'created_at'            => $attended,
          'updated_at'            => $attended,
        ]);
        DB::table('patient_plans')->where('id', $assignedPlans[$pId])->increment('sessions_used');
      } else {
        // Pago al contado o deuda
        if ($faker->boolean(70)) {
          // === payments (ajustado a tu esquema) ===
          $ptxId = DB::table('payments')->insertGetId([
            'patient_id'            => $pId,
            'treatment_id'          => $tId,
            'treatment_session_id'  => $tsId,
            'date'                  => $date,
            'concept'               => 'Pago sesión kinesióloga',
            'amount_clp'            => $basePrice,
            'copay_clp'             => 0,
            'insurance_covered_clp' => 0,
            'payment_method'        => $faker->randomElement(['webpay', 'cash', 'transfer']),
            'status'                => 'completed',
            'paid_at'               => $attended,
            'invoice'               => null,
            'notes'                 => null,
            'created_at'            => $attended,
            'updated_at'            => $attended,
          ]);

          // Elige/obtén la empresa (si tienes varias, usa random)
          $companyId = DB::table('companies')->inRandomOrder()->value('id') ?? 1;

          // Si quieres folios “bonitos”, puedes llevar un contador en memoria (opcional)
          static $folioCounter = null;
          if ($folioCounter === null) {
            // arranca desde el último folio existente o un base
            $lastFolio = DB::table('invoices')->max('folio');
            $folioCounter = is_numeric($lastFolio) ? ((int)$lastFolio + 1) : 10000;
          }

          // Decide tipo de DTE: 41 (Boleta Exenta) o 39 (Boleta afecto) o 33 (Factura)
          $dteType = $faker->randomElement([41, 41, 41, 39]); // sesgo a exenta como usabas antes (sin IVA)
          $total = (int) $basePrice;

          // Calcular neto/IVA según tipo
          if ($dteType === 41) { // Boleta Exenta
            $net  = $total;
            $iva  = 0;
          } else {
            // IVA 19%
            $net = (int) round($total / 1.19);
            $iva = $total - $net;
          }


          $folio = (string) $folioCounter++;
          if (DB::table('invoices')->where('folio', $folio)->exists()) {
            $folio = Str::ulid()->toBase32(); // fallback único
          }

          // === invoices/invoice_items: ajusta si tus migraciones difieren ===
          $invId = DB::table('invoices')->insertGetId([

            'patient_id'   => $pId,
            'payment_id'   => $ptxId,                  // enlaza al pago que acabas de crear
            'dte_type'     => $dteType,                // 33/39/41
            'folio'        => $folio,                  // único
            'issue_date'   => $attended->toDateString(),
            'net_clp'      => $net,
            'iva_clp'      => $iva,
            'total_clp'    => $total,
            'metadata'     => json_encode([
              'seeded' => true,
              'note'   => 'Documento de prueba (no enviado a SII)',
            ], JSON_UNESCAPED_UNICODE),
            'created_at'   => $attended,
            'updated_at'   => $attended,
          ]);

          $qty = 1.00;
          DB::table('invoice_items')->insert([
            'invoice_id'           => $invId,
            'treatment_session_id' => $tsId,
            'treatment_id'         => $tId,
            'description'          => 'Atención kinesióloga',
            'quantity'             => $qty,                         // DECIMAL(10,2)
            'unit_price_clp'       => $total,                      // precio unitario en CLP (entero)
            'total_clp'            => (int) round($total * $qty),  // total línea en CLP (entero)
            'created_at'           => $attended,
            'updated_at'           => $attended,
          ]);

          // Asignación del pago a la boleta (si usas esta tabla)
          DB::table('payment_allocations')->insert([
            'payment_id'    => $ptxId,
            'debt_id'       => null,
            'amount'        => $basePrice,
            'created_at'    => $attended,
            'updated_at'    => $attended,
          ]);
        } else {
          // === genera deuda (ajusta a tu migración real de debts) ===
          DB::table('debts')->insert([
            'patient_id'            => $patientId,
            'treatment_session_id'  => $tsId,
            'original_amount'       => $basePrice,
            'paid_amount'           => 0,
            'status'                => 'pending',
            'due_date'              => Carbon::now()->addDays(10)->toDateString(),
            'payment_reminders_sent' => 0,
            'created_at'            => $attended,
            'updated_at'            => $attended,
          ]);
        }
      }

      // Nota clínica
      DB::table('clinical_notes')->insert([
        'patient_id'           => $pId,
        'doctor_id'            => $dId,
        'treatment_session_id' => $tsId,
        'treatment_id'         => $tId, // opcional: referencia directa al tratamiento

        'subjective'           => $faker->optional()->sentence(10),
        'objective'            => $faker->optional()->sentence(8),
        'assessment'           => $faker->optional()->sentence(12),
        'plan'                 => $faker->optional()->sentence(12),

        'diagnoses'            => json_encode([
          ['code' => 'M75.1', 'system' => 'ICD-10', 'text' => 'Síndrome manguito rotador']
        ], JSON_UNESCAPED_UNICODE),

        'procedures'           => json_encode([
          ['code' => 'KINE01', 'text' => 'Movilización articular', 'units' => 1]
        ], JSON_UNESCAPED_UNICODE),

        'goals'                => json_encode([
          ['text' => 'Mejorar rango articular', 'due' => $attended->copy()->addWeeks(2)->toDateString()]
        ], JSON_UNESCAPED_UNICODE),

        'forms'                => json_encode([]),

        'is_signed'            => $faker->boolean(60),
        'signed_at'            => $faker->boolean(50) ? $attended->copy()->addMinutes(30) : null,

        'signed_by_user_id'    => null, // si quieres, pon aquí un $faker->randomElement($userIds)
        'meta'                 => json_encode([]),

        'created_at'           => $attended,
        'updated_at'           => $attended,
      ]);


      // Vitales ocasionales (sin cambios, salvo coherencia de fechas)
      if ($faker->boolean(25)) {
        DB::table('vitals')->insert([
          'patient_id'            => $pId,
          'recorded_by_user_id'   => $user['id'],
          'recorded_at'           => $attended,
          'height_cm'             => 170,
          'weight_kg'             => 75,
          'bmi'                   => round(75 / (1.7 * 1.7), 2),
          'bp_systolic'           => '120',
          'bp_diastolic'          => '80',
          'heart_rate'            => 72,
          'resp_rate'             => 16,
          'temperature_c'         => 36.7,
          'spo2'                  => 98,
          'meta'                  => json_encode([]),
          'created_at'            => $attended,
          'updated_at'            => $attended,
        ]);
      }
    }


    // ============= PAYROLL (último mes por cada kine) =============
    $now = now();
    $periodStart = Carbon::now()->startOfMonth()->subMonth(); // mes anterior
    $periodEnd   = (clone $periodStart)->endOfMonth();

    $doctorIds = DB::table('doctors')->pluck('id');

    foreach ($doctorIds as $did) {
      $sessions = DB::table('treatment_sessions')
        ->where('doctor_id', $did) // ojo: en la migration era kinesiologist_id, no doctor_id
        ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
        ->where('status', 'Completada')
        ->get();

      if ($sessions->isEmpty()) continue;

      $totals = [
        'sessions' => $sessions->count(),
        'patient'  => $sessions->sum('patient_amount_clp'),
        'doctor'   => $sessions->sum('doctor_amount_cl'),
        'clinic'   => $sessions->sum('clinic_amount_cl'),
      ];

      $payrollId = DB::table('payrolls')->insertGetId([
        'doctor_id' => $did,
        'period_start' => $periodStart->toDateString(), // representamos el mes con el primer día
        'period_end' => $periodStart->toDateString(), // representamos el mes con el primer día
        'total_sessions' => $totals['doctor'],
        'total_patient_amount' => $totals['patient'],
        'total_commission_amount' => 0,
        'total_adjustments' => 0,
        'total_payable' => $totals['doctor'], // neto = doctor_amount (si no hay reglas)
        'status' => 'draft',
        'paid_at' => $now,
        'payment_method' => "transferencia",
        'payment_reference' => "folio",
        'created_at' => $now,
        'updated_at' => $now,
      ]);

      foreach ($sessions as $s) {
        DB::table('payroll_details')->insert([
          'payroll_id' => $payrollId,
          'treatment_session_id' => $s->id,
          'patient_id' => $patientId,
          'doctor_id' => $did,
          'session_type_id' => null,
          'service_date' => $now,
          'attended' => true,
          'created_at' => $now,
          'updated_at' => $now,
        ]);
      }
    }

    // ============= WEBHOOK EVENTS (dummy) =============
    DB::table('webhook_events')->insert([

      'provider' => 'webpay',
      'event_type' => 'transaction.confirmed',
      'idempotency_key' => $faker->uuid(),
      'payload' => json_encode(['sample' => true]),
      'processed_at' => $now,
      'created_at' => $now,
      'updated_at' => $now
    ]);

    // ============= MEDICAL RECORDS (crear 1:1 para todos los pacientes) =============
    foreach ($patientIds as $pid) {
      DB::table('medical_records')->insert([
        'patient_id' => $pid,
        'allergies' => json_encode([]),
        'conditions' => json_encode([]),
        'medications' => json_encode([]),
        'surgeries' => json_encode([]),
        'immunizations' => json_encode([]),
        'family_history' => json_encode([]),
        'social_history' => json_encode([]),
        'alerts' => json_encode([]),
        'emergency_name' => $faker->firstName() . ' ' . $faker->lastName(),
        'emergency_phone' => $faker->phoneNumber,
        'emergency_relation' => 'Familiar',
        'general_notes' => null,
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    $rows = [];
    foreach ($patientIds as $pid) {
      $doc = $faker->randomElement($doctorIds);
      $rows[] = [
        'doctor_id'  => $doc,
        'patient_id' => $pid,
        'role'       => $faker->randomElement(['primary', 'therapist', 'consulting']),
        'started_at' => now()->subDays($faker->numberBetween(0, 120))->toDateString(),
        'ended_at'   => null,
        'notes'      => $faker->optional()->sentence(),
        'meta'       => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
      ];
    }
    DB::table('doctor_patient_assignments')->upsert(
      $rows,
      ['doctor_id', 'patient_id', 'ended_at'], // coincide con el UNIQUE
      ['role', 'notes', 'meta', 'updated_at']
    );

    // Listo 🎉
  }
}
