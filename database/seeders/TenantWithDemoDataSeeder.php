<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Carbon\Carbon;

class TenantWithDemoDataSeeder extends Seeder
{
  public function run(): void
  {
    $faker = Faker::create('es_CL');
    $now   = now();


    // ============= USERS (admin, reception, kine, finance) =============
    $users = [
      ['name' => 'Admin', 'last_name' => 'Demo', 'email' => 'admin@demo.test', 'role' => 'admin'],
      ['name' => 'Recepción', 'last_name' => 'Demo', 'email' => 'recepcion@demo.test', 'role' => 'reception'],
      ['name' => 'Kine', 'last_name' => 'Demo', 'email' => 'kine@demo.test', 'role' => 'kine'],
      ['name' => 'Finanzas', 'last_name' => 'Demo', 'email' => 'finanzas@demo.test', 'role' => 'finance'],
    ];
    $userIds = [];
    foreach ($users as $u) {
      $id = DB::table('users')->insertGetId([
        'name' => $u['name'],
        'last_name' => $u['last_name'],
        'email' => $u['email'],
        'password' => Hash::make('password'),
        'role' => $u['role'],
        'created_at' => $now,
        'updated_at' => $now,
      ]);
      $userIds[$u['role']] = $id;
    }

    // ============= BRANCHES & ROOMS =============
    $branchId = DB::table('branches')->insertGetId([

      'name' => 'Casa Matriz',
      'code' => 'MTRZ',
      'timezone' => 'America/Santiago',
      'created_at' => $now,
      'updated_at' => $now
    ]);
    $roomIds = [];
    foreach (['Box 1', 'Box 2', 'Box 3'] as $rName) {
      $roomIds[] = DB::table('rooms')->insertGetId([

        'branch_id' => $branchId,
        'name' => $rName,
        'status' => 'available',
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    // ============= DOCTORS (kines) =============
    $doctorIds = [];
    // Kine principal ligado al user kine@demo.test
    $doctorIds[] = DB::table('doctors')->insertGetId([

      'user_id' => $userIds['kine'],
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
        'role' => 'kine',
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
        'is_active' => 1,
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

    // ============= COMPANY SETTINGS (DTE/WebPay placeholders) =============
    DB::table('company_settings')->insert([

      'business_name' => 'Clínica Senex Demo SpA',
      'rut' => '76.123.456-7',
      'address' => 'Av. Siempre Viva 123',
      'city' => 'Santiago',
      'region' => 'RM',
      'economic_activity_code' => '862010',
      'tax_rate' => 19,
      'sii_resolution_number' => null,
      'sii_resolution_date' => null,
      'invoice_api_credentials' => json_encode(['provider' => 'LibreDTE', 'api_key' => '<TU_API_KEY_AQUI>']),
      'webpay_credentials' => json_encode(['commerce_code' => '597055555532', 'api_key' => '<TBK_API_KEY>', 'environment' => 'TEST']),
      'created_at' => $now,
      'updated_at' => $now
    ]);

    // ============= AVAILABILITIES (turnos) =============
    foreach ($doctorIds as $did) {
      DB::table('availabilities')->insert([

        'doctor_id' => $did,
        'timezone' => 'America/Santiago',
        'rrule' => 'FREQ=WEEKLY;BYDAY=MO,TU,TH;BYHOUR=9;COUNT=100',
        'start_time' => '09:00:00',
        'end_time' => '18:00:00',
        'valid_from' => Carbon::now()->subWeeks(2)->toDateString(),
        'valid_until' => null,
        'is_active' => 1,
        'meta' => json_encode([]),
        'created_at' => $now,
        'updated_at' => $now
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

    // ============= PATIENT PLANS (a ~10 pacientes) =============
    $assignedPlans = [];
    foreach (array_slice($patientIds, 0, 10) as $pid) {
      $planId = $faker->randomElement($planIds);
      $purchasedAt = Carbon::now()->subDays($faker->numberBetween(1, 60));
      $expiry = (clone $purchasedAt)->addMonths(
        DB::table('plans')->where('id', $planId)->value('valid_months') ?? 12
      )->toDateString();

      $ptxId = DB::table('payment_transactions')->insertGetId([
        'patient_id' => $pid,
        'treatment_session_id' => null,
        'amount' => DB::table('plans')->where('id', $planId)->value('price'),
        'payment_method' => $faker->randomElement(['webpay', 'cash', 'transfer']),
        'status' => 'completed',
        'paid_at' => $purchasedAt->toDateTimeString(),
        'currency' => 'CLP',
        'provider_txn_id' => $faker->uuid(),
        'provider_payload' => json_encode([]),
        'notes' => null,
        'created_at' => $purchasedAt,
        'updated_at' => $purchasedAt
      ]);

      $assignedPlans[$pid] = DB::table('patient_plans')->insertGetId([
        'patient_id' => $pid,
        'plan_id' => $planId,
        'purchased_at' => $purchasedAt,
        'expiry_date' => $expiry,
        'sessions_included' => DB::table('plans')->where('id', $planId)->value('total_sessions'),
        'sessions_used' => 0,
        'status' => 'active',
        'payment_transaction_id' => $ptxId,
        'created_at' => $purchasedAt,
        'updated_at' => $purchasedAt
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
      $treatmentIds[] = DB::table('treatments')->insertGetId([
        'patient_id' => $faker->randomElement($patientIds),
        'doctor_id' => $faker->randomElement($doctorIds),
        'session_type_id' => $faker->randomElement([$sessionTypeIds[0], $sessionTypeIds[1], null]),
        'planned_sessions' => $faker->boolean(50) ? $faker->numberBetween(6, 12) : null,
        'is_indefinite' => $faker->boolean(30),
        'status' => $faker->randomElement(['active', 'active', 'paused']),
        'start_date' => Carbon::now()->subDays($faker->numberBetween(5, 40))->toDateString(),
        'end_date' => null,
        'notes' => $faker->sentence(10),
        'created_at' => $now,
        'updated_at' => $now
      ]);
    }

    // ============= TREATMENT SESSIONS (80+) + pagos/deudas + notas clínicas
    $tsIds = [];
    foreach (range(1, 80) as $i) {
      $tId = $faker->randomElement($treatmentIds);
      $pId = DB::table('treatments')->where('id', $tId)->value('patient_id');
      $dId = DB::table('treatments')->where('id', $tId)->value('doctor_id');
      $stypeId = $faker->randomElement($sessionTypeIds);
      $attended = Carbon::now()->subDays($faker->numberBetween(0, 25))->setTime($faker->numberBetween(9, 18), $faker->randomElement([0, 15, 30, 45]));
      $basePrice = DB::table('session_types')->where('id', $stypeId)->value('base_price');

      // calcular comisión simple al 60% (o fijo si cae)
      $rate = DB::table('doctor_commission_rates')
        ->where('doctor_id', $dId)->where('session_type_id', $stypeId)
        ->orderByDesc('effective_from')->first();
      $doctorAmount = 0;
      if ($rate) {
        if ($rate->commission_type === 'percentage') {
          $doctorAmount = round($basePrice * ($rate->commission_value / 100), 0);
        } else {
          $doctorAmount = (float)$rate->commission_value;
        }
      }
      $clinicAmount = $basePrice - $doctorAmount;

      $tsId = DB::table('treatment_sessions')->insertGetId([
        'treatment_id' => $tId,
        'appointment_id' => null,
        'doctor_id' => $dId,
        'patient_id' => $pId,
        'session_type_id' => $stypeId,
        'attended_at' => $attended,
        'status' => 'completed',
        'session_number' => $faker->numberBetween(1, 12),
        'patient_amount' => $basePrice,
        'doctor_amount' => $doctorAmount,
        'clinic_amount' => $clinicAmount,
        'notes' => $faker->boolean(20) ? $faker->sentence(8) : null,
        'meta' => json_encode([]),
        'created_at' => $attended,
        'updated_at' => $attended
      ]);
      $tsIds[] = $tsId;

      // ¿Paciente tiene plan activo que cubra?
      $planUse = (isset($assignedPlans[$pId]) && $faker->boolean(50));
      if ($planUse) {
        DB::table('plan_session_consumptions')->insert([

          'patient_plan_id' => $assignedPlans[$pId],
          'treatment_session_id' => $tsId,
          'sessions_consumed' => 1,
          'consumed_at' => $attended,
          'created_at' => $attended,
          'updated_at' => $attended
        ]);
        DB::table('patient_plans')->where('id', $assignedPlans[$pId])->increment('sessions_used');
      } else {
        // Pago al contado o deuda
        if ($faker->boolean(70)) {
          // pago completo
          $ptxId = DB::table('payment_transactions')->insertGetId([
            'patient_id' => $pId,
            'treatment_session_id' => $tsId,
            'amount' => $basePrice,
            'payment_method' => $faker->randomElement(['webpay', 'cash', 'transfer']),
            'status' => 'completed',
            'paid_at' => $attended,
            'currency' => 'CLP',
            'provider_txn_id' => $faker->uuid(),
            'provider_payload' => json_encode([]),
            'notes' => null,
            'created_at' => $attended,
            'updated_at' => $attended
          ]);
          // emitir boleta (borrador aceptado)
          $invId = DB::table('invoices')->insertGetId([
            'patient_id' => $pId,
            'treatment_session_id' => $tsId,
            'patient_plan_id' => null,
            'type' => 'boleta',
            'document_number' => null,
            'issue_date' => $attended->toDateString(),
            'subtotal' => $basePrice,
            'tax_amount' => 0,
            'total_amount' => $basePrice,
            'sii_status' => 'pending',
            'sii_track_id' => null,
            'pdf_path' => null,
            'xml_path' => null,
            'status' => 'issued',
            'meta' => json_encode([]),
            'created_at' => $attended,
            'updated_at' => $attended
          ]);
          DB::table('invoice_items')->insert([
            'invoice_id' => $invId,
            'description' => 'Atención kinesióloga',
            'session_type_id' => $stypeId,
            'quantity' => 1,
            'unit_price' => $basePrice,
            'discount_amount' => 0,
            'line_total' => $basePrice,
            'tax_exempt' => 1,
            'sii_item_code' => null,
            'created_at' => $attended,
            'updated_at' => $attended
          ]);
          // allocation directo (opcional)
          DB::table('payment_allocations')->insert([
            'payment_transaction_id' => $ptxId,
            'debt_id' => null,
            'invoice_id' => $invId,
            'amount' => $basePrice,
            'created_at' => $attended,
            'updated_at' => $attended
          ]);
        } else {
          // genera deuda
          DB::table('debts')->insert([

            'treatment_session_id' => $tsId,
            'original_amount' => $basePrice,
            'paid_amount' => 0,
            'status' => 'pending',
            'due_date' => Carbon::now()->addDays(10)->toDateString(),
            'payment_reminders_sent' => 0,
            'created_at' => $now,
            'updated_at' => $now
          ]);
        }
      }

      // Nota clínica rápida
      DB::table('clinical_notes')->insert([
        'patient_id' => $pId,
        'doctor_id' => $dId,
        'treatment_session_id' => $tsId,
        'appointment_id' => null,
        'subjective' => $faker->sentence(10),
        'objective' => $faker->sentence(8),
        'assessment' => $faker->sentence(12),
        'plan' => 'Continuar con plan terapéutico',
        'diagnoses' => json_encode([['code' => 'M75.1', 'system' => 'ICD-10', 'text' => 'Síndrome manguito rotador']]),
        'procedures' => json_encode([['code' => 'KINE01', 'text' => 'Movilización articular', 'units' => 1]]),
        'goals' => json_encode([['text' => 'Mejorar rango articular', 'due' => $attended->copy()->addWeeks(2)->toDateString()]]),
        'forms' => json_encode([]),
        'is_signed' => $faker->boolean(60),
        'signed_at' => $faker->boolean(50) ? $attended->copy()->addMinutes(30) : null,
        'signed_by_user_id' => null,
        'meta' => json_encode([]),
        'created_at' => $attended,
        'updated_at' => $attended
      ]);

      // Vitales ocasionales
      if ($faker->boolean(25)) {
        DB::table('vitals')->insert([

          'patient_id' => $pId,
          'recorded_by_user_id' => $userIds['kine'],
          'recorded_at' => $attended,
          'height_cm' => 170,
          'weight_kg' => 75,
          'bmi' => round(75 / (1.7 * 1.7), 2),
          'bp_systolic' => '120',
          'bp_diastolic' => '80',
          'heart_rate' => 72,
          'resp_rate' => 16,
          'temperature_c' => 36.7,
          'spo2' => 98,
          'meta' => json_encode([]),
          'created_at' => $attended,
          'updated_at' => $attended
        ]);
      }
    }

    // ============= PAYROLL (último mes por cada kine) =============
    $periodStart = Carbon::now()->startOfMonth()->subMonth();
    $periodEnd   = (clone $periodStart)->endOfMonth();

    foreach ($doctorIds as $did) {
      $sessions = DB::table('treatment_sessions')
        ->where('doctor_id', $did)
        ->whereBetween('attended_at', [$periodStart, $periodEnd])
        ->get();

      if ($sessions->isEmpty()) continue;

      $totals = [
        'sessions' => $sessions->count(),
        'patient'  => (float) $sessions->sum('patient_amount'),
        'doctor'   => (float) $sessions->sum('doctor_amount'),
        'clinic'   => (float) $sessions->sum('clinic_amount'),
      ];

      $payrollId = DB::table('payrolls')->insertGetId([

        'doctor_id' => $did,
        'period_start' => $periodStart->toDateString(),
        'period_end' => $periodEnd->toDateString(),
        'total_sessions' => $totals['sessions'],
        'total_patient_amount' => $totals['patient'],
        'total_doctor_amount' => $totals['doctor'],
        'total_clinic_amount' => $totals['clinic'],
        'status' => 'draft',
        'paid_at' => null,
        'created_at' => $now,
        'updated_at' => $now
      ]);

      foreach ($sessions as $s) {
        DB::table('payroll_details')->insert([

          'payroll_id' => $payrollId,
          'treatment_session_id' => $s->id,
          'session_type_name' => DB::table('session_types')->where('id', $s->session_type_id)->value('name') ?? 'N/D',
          'patient_amount' => $s->patient_amount,
          'doctor_amount' => $s->doctor_amount,
          'commission_rate' => 0, // si quieres guardar % aplicado real, ajusta en lógica
          'created_at' => $now,
          'updated_at' => $now
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

    // Listo 🎉
  }
}
