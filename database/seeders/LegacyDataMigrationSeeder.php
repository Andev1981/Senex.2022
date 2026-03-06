<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Address;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\DoctorPatientAssignment;
use App\Models\PatientContact;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Commune;
use App\Enums\TreatmentStatusEnum;
use App\Enums\AppointmentStatusEnum;
use App\Enums\SessionCategoryEnum;
use App\Enums\FinanceStatusEnum;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Str;

class LegacyDataMigrationSeeder extends Seeder
{
    protected $oldAddresses = [];
    protected $oldUsers = [];
    protected $keepersMap = []; 
    protected $migratedUsersMap = []; 
    protected $migratedPatientsMap = []; 
    protected $migratedDoctorsMap = []; 
    protected $sessionTypesMap = []; 
    
    protected $oldCommuneNames = []; 
    protected $newCommuneIds = [];   
    
    // Manual mapping for known mismatches (Normalized OLD => Normalized NEW)
    protected $manualCommuneMapping = [
        'SANTIAGO' => 'SANTIAGO CENTRO',
    ];

    public function run(): void
    {
        ini_set('memory_limit', '2048M'); 

        DB::transaction(function () {
            $this->command->info('Starting Enhanced Legacy Data Migration (2026-02-04) with Smart Commune Mapping...');

            $this->loadCommuneMappings();

            $this->loadAddresses();
            $this->loadKeepers(); 
            $this->migrateUsers();
            $this->migratePatients();
            $this->migrateDoctors();
            $this->migrateSessionTypes();
            $this->migrateGuardians(); 
            $this->migrateClinicalData();
            $this->migrateAssignments();

            $this->command->info('Legacy Data Migration Completed Successfully.');
        });
    }

    protected function loadCommuneMappings()
    {
        $this->command->info('Loading Commune Mappings...');

        // 1. Load Old Communes
        $rows = $this->parseSqlFile('comunas_202602042236.sql', 'comunas', ['id', 'name']);
        foreach ($rows as $row) {
            $this->oldCommuneNames[$row['id']] = $this->normalizeName($row['name']);
        }
        $this->command->info('Loaded ' . count($this->oldCommuneNames) . ' old communes.');

        // 2. Load New Communes
        $newCommunes = Commune::all();
        foreach ($newCommunes as $commune) {
            $norm = $this->normalizeName($commune->name);
            $this->newCommuneIds[$norm] = $commune->id;
        }
        $this->command->info('Loaded ' . count($this->newCommuneIds) . ' new communes from DB.');
    }

    protected function normalizeName($name)
    {
        if (!$name) return '';
        $name = mb_strtoupper($name, 'UTF-8');
        $replacements = [
            'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ñ' => 'N',
            'Ü' => 'U',
        ];
        $name = strtr($name, $replacements);
        return trim($name);
    }

    protected function resolveCommuneId($oldCommuneId)
    {
        if (!$oldCommuneId) return null;

        $oldName = $this->oldCommuneNames[$oldCommuneId] ?? null; // Already normalized in load
        if (!$oldName) return null;

        // 1. Try Manual Override
        if (isset($this->manualCommuneMapping[$oldName])) {
            $targetName = $this->manualCommuneMapping[$oldName]; // Assuming this is normalized
            if (isset($this->newCommuneIds[$targetName])) {
                return $this->newCommuneIds[$targetName];
            }
        }

        // 2. Try Direct Match
        if (isset($this->newCommuneIds[$oldName])) {
            return $this->newCommuneIds[$oldName];
        }

        // 3. Try Partial Match (Fuzzy) - Optional but safer for simple typos
        // e.g. "LAS CONDES" vs "LAS CONDES."
        // For now, let's just log failure to allow manual addition
        return null;
    }

    protected function loadKeepers()
    {
        $this->command->info('Pre-loading Keepers...');
        $rows = $this->parseSqlFile('keepers_202602041817.sql', 'keepers', [
            'id', 'name', 'last_name', 'email', 'phone', 'parentesco', 'user_id', 'address_id', 'created_at', 'updated_at', 'patient_id'
        ]);
        foreach ($rows as $row) {
            $this->keepersMap[$row['patient_id']] = $row;
        }
    }

    protected function loadAddresses()
    {
        $this->command->info('Loading Addresses...');
        $rows = $this->parseSqlFile('addresses_202602041813.sql', 'addresses', ['id', 'street', 'number', 'address', 'latitude', 'longitude', 'comuna_id']);
        
        foreach ($rows as $row) {
            $this->oldAddresses[$row['id']] = $row;
        }
        $this->command->info("Loaded " . count($this->oldAddresses) . " addresses.");
    }

    protected function migrateUsers()
    {
        $this->command->info('Migrating Users...');
        $rows = $this->parseSqlFile('users_202602041817.sql', 'users', [
            'id', 'name', 'last_name', 'email', 'password', 'avatar', 'rut', 'birth', 'phone', 'address_id', 
            'email_verified_at', 'status', 'user_type', 'deleted_at', 'remember_token', 'created_at', 'updated_at', 'payment_status'
        ]);

        $companyId = 2;
        $branch = Branch::where('company_id', $companyId)->where('is_main', true)->first();
        $branchId = $branch ? $branch->id : 2;

        foreach ($rows as $row) {
            $oldId = $row['id'];

            $existingUser = User::where('email', $row['email'])->first();
            
            if ($existingUser) {
                $this->migratedUsersMap[$oldId] = $existingUser->id;
                $existingUser->branches()->syncWithoutDetaching([$branchId]);
                continue;
            }

            $user = User::create([
                'company_id' => 2,
                'name' => trim($row['name'] . ' ' . ($row['last_name'] ?? '')),
                'email' => $row['email'],
                'password' => $row['password'] ?: Hash::make('password'),
                'created_at' => $this->parseDate($row['created_at']),
                'updated_at' => $this->parseDate($row['updated_at']),
            ]);

            $role = match($row['user_type']) {
                'Administrador' => 'admin',
                'Super-Administrador' => 'superadmin',
                'Kine' => 'kine',
                'Paciente' => 'patient',
                default => 'patient'
            };
            if (!Role::where('name', $role)->exists()) {
                Role::create(['name' => $role]);
            }
            $user->assignRole($role);
            $user->branches()->syncWithoutDetaching([$branchId]);

            $this->migratedUsersMap[$oldId] = $user->id;
            $this->oldUsers[$oldId] = $row;
        }
    }

    protected function migratePatients()
    {
        $this->command->info('Migrating Patients...');
        $rows = $this->parseSqlFile('patients_202602041813.sql', 'patients', [
            'id', 'user_id', 'name', 'last_name', 'avatar', 'rut', 'birth', 'phone', 'address_id', 
            'status', 'payment_status', 'created_at', 'updated_at', 'email', 'order', 'orden'
        ]);
        
        $companyId = 2;
        $branch = Branch::where('company_id', $companyId)->where('is_main', true)->first();
        $branchId = $branch ? $branch->id : 2;

        foreach ($rows as $row) {
            $oldPatientId = $row['id'];
            
            $keeper = $this->keepersMap[$oldPatientId] ?? null;
            $birthDate = $this->parseDate($row['birth']);
            $age = $birthDate ? $birthDate->age : 99;
            $isMinor = $age < 18;

            $targetName = null;
            $targetEmail = null;
            $needsTutor = false;

            if ($isMinor && $keeper) {
                $targetName = trim($keeper['name'] . ' ' . ($keeper['last_name'] ?? ''));
                $targetEmail = !empty($keeper['email']) ? $keeper['email'] : ($keeper['phone'] ?? uniqid()) . '@tutor.senex.cl';
                $needsTutor = true;
            } else {
                $targetName = trim($row['name'] . ' ' . ($row['last_name'] ?? ''));
                $targetEmail = !empty($row['email']) ? $row['email'] : ($row['rut'] ?? uniqid()) . '@paciente.senex.cl';
            }

            $patientRoleName = 'patient';
            if (!Role::where('name', 'patient')->exists()) {
                Role::create(['name' => 'patient']);
            }

            $user = User::where('email', $targetEmail)->first();
            
            if (!$user) {
                $user = User::create([
                    'company_id' => 2,
                    'name' => $targetName,
                    'email' => $targetEmail,
                    'password' => Hash::make('secret123'),
                    'created_at' => $this->parseDate($row['created_at']),
                    'updated_at' => $this->parseDate($row['updated_at']),
                ]);
            }
            
            if (!$user->hasRole($patientRoleName)) {
                $user->assignRole($patientRoleName);
            }
            $user->branches()->syncWithoutDetaching([$branchId]);
            
            $newUserId = $user->id;

            $rut = $row['rut'];
            if (Patient::where('rut', $rut)->exists()) {
                $originalRut = $rut; 
                $rut = $rut . '-' . $oldPatientId; 
                $this->command->warn("Duplicate RUT {$originalRut}. Created distinct record with RUT {$rut}.");
            }

            $patient = Patient::create([
                'company_id' => 2,
                'user_id' => $newUserId,
                'name' => trim($row['name']),
                'last_name' => trim($row['last_name']),
                'rut' => $rut, 
                'email' => $row['email'],
                'phone' => $row['phone'],
                'birth_date' => $this->parseDate($row['birth'], true),
                'status' => $row['status'] == 1 ? 'active' : 'inactive',
                'require_tutor' => $needsTutor,
                'created_at' => $this->parseDate($row['created_at']),
                'updated_at' => $this->parseDate($row['updated_at']),
                'gender' => \App\Enums\GenderEnum::OTHER, 
                'marital_status' => \App\Enums\MaritalStatusEnum::SINGLE,
            ]);
            
            $patient->branches()->syncWithoutDetaching([$branchId]);

            $this->migratedPatientsMap[$oldPatientId] = $patient;

            $addrId = $row['address_id'];
            if ($addrId && isset($this->oldAddresses[$addrId])) {
                $addrData = $this->oldAddresses[$addrId];
                
                $oldCommuneId = is_numeric($addrData['comuna_id']) ? (int)$addrData['comuna_id'] : null;
                $newCommuneId = $this->resolveCommuneId($oldCommuneId);
                
                if ($oldCommuneId && !$newCommuneId) {
                    $this->command->warn("Mapping Failed: Old Commune ID {$oldCommuneId} (Name: " . ($this->oldCommuneNames[$oldCommuneId] ?? 'Unknown') . ") not found in new DB.");
                }

                $patient->address()->create([
                    'street' => $addrData['street'] ?? 'Sin Calle',
                    'number' => $addrData['number'] ?? '',
                    'details' => $addrData['address'] ?? '',
                    'commune_id' => $newCommuneId,
                ]);
            }
        }
    }

    protected function migrateDoctors()
    {
        $this->command->info('Migrating Doctors...');
        $rows = $this->parseSqlFile('doctors_202602041815.sql', 'doctors', [
            'id', 'user_id', 'name', 'last_name', 'avatar', 'rut', 'birth', 'phone', 'address_id', 'status', 'created_at', 'updated_at'
        ]);

        $companyId = 2;
        $branch = Branch::where('company_id', $companyId)->where('is_main', true)->first();
        $branchId = $branch ? $branch->id : 2;

        foreach ($rows as $row) {
            $oldDoctorId = $row['id'];

            $doctor = Doctor::where('rut', $row['rut'])
                ->orWhere(function($q) use ($row) {
                    $q->where('name', $row['name'])
                      ->where('last_name', $row['last_name']);
                })->first();

            if ($doctor) {
                $this->migratedDoctorsMap[$oldDoctorId] = $doctor;
                $doctor->branches()->syncWithoutDetaching([$branchId]);
                $this->command->info("Homologated Doctor: {$row['name']} {$row['last_name']} matches existing Doctor ID {$doctor->id}.");
                continue;
            }

            $doctorUser = null;
            $email = ($row['rut'] ?? uniqid()) . '@senex-doctor.cl'; 

            $doctorUser = User::where('email', $email)->first();

            if (!$doctorUser) {
                $doctorUser = User::create([
                    'company_id' => 2,
                    'name' => trim($row['name'] . ' ' . ($row['last_name'] ?? '')),
                    'email' => $email,
                    'password' => Hash::make('doctor123'), 
                    'created_at' => $this->parseDate($row['created_at']),
                    'updated_at' => $this->parseDate($row['updated_at']),
                ]);
                $doctorUser->assignRole('kine');
            }
            $doctorUser->branches()->syncWithoutDetaching([$branchId]);

            $rut = $row['rut'];
            if (Doctor::where('rut', $rut)->exists()) {
                $rut = $rut . '-' . $oldDoctorId;
            }

            $doctor = Doctor::create([
                'company_id' => 2,
                'user_id' => $doctorUser->id,
                'name' => $row['name'],
                'last_name' => $row['last_name'],
                'rut' => $rut,
                'phone' => $row['phone'],
                'email' => $doctorUser->email,
                'created_at' => $this->parseDate($row['created_at']),
                'updated_at' => $this->parseDate($row['updated_at']),
            ]);
            
            $doctor->branches()->syncWithoutDetaching([
                $branchId => ['status' => ($row['status'] == 1 ? 'active' : 'suspended')]
            ]);

            $this->migratedDoctorsMap[$oldDoctorId] = $doctor;

            $addrId = $row['address_id'];
            if ($addrId && isset($this->oldAddresses[$addrId])) {
                $addrData = $this->oldAddresses[$addrId];

                $oldCommuneId = is_numeric($addrData['comuna_id']) ? (int)$addrData['comuna_id'] : null;
                $newCommuneId = $this->resolveCommuneId($oldCommuneId);

                $doctor->address()->create([
                    'street' => $addrData['street'] ?? 'Sin Calle',
                    'number' => $addrData['number'] ?? '',
                    'details' => $addrData['address'] ?? '',
                    'commune_id' => $newCommuneId,
                ]);
            }
        }
    }

    protected function migrateSessionTypes()
    {
        $this->command->info('Migrating Session Types...');
        $rows = $this->parseSqlFile('application_types_202602041814.sql', 'application_types', [
            'id', 'name', 'description', 'created_at', 'updated_at', 'estado'
        ]);

        $companyId = 2;

        foreach ($rows as $row) {
            $oldId = $row['id'];
            
            $category = SessionCategoryEnum::KINESIOLOGY;
            if (Str::contains(Str::upper($row['name']), ['EVAL', 'EVA'])) {
                $category = SessionCategoryEnum::EVALUATION;
            }

            $type = SessionType::create([
                'company_id' => $companyId,
                'name' => $row['name'],
                'code' => Str::slug($row['name']) . '-' . $oldId,
                'category' => $category,
                'duration_minutes' => 60,
                'base_price_clp' => 35000, 
                'requires_diagnosis' => false,
                'is_active' => $row['estado'] == 1,
                'created_at' => $this->parseDate($row['created_at']),
                'updated_at' => $this->parseDate($row['updated_at']),
            ]);

            $this->sessionTypesMap[$oldId] = $type->id;
        }
    }

    protected function migrateGuardians()
    {
        $this->command->info('Migrating Keepers (Guardians)...');
        $rows = $this->parseSqlFile('keepers_202602041817.sql', 'keepers', [
            'id', 'name', 'last_name', 'email', 'phone', 'parentesco', 'user_id', 'address_id', 'created_at', 'updated_at', 'patient_id'
        ]);

        foreach ($rows as $row) {
            $oldPatientId = $row['patient_id'];
            $patient = $this->migratedPatientsMap[$oldPatientId] ?? null;

            if ($patient) {
                PatientContact::create([
                    'patient_id' => $patient->id,
                    'name' => $row['name'] . ' ' . $row['last_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'relationship' => $row['parentesco'] ?? 'Other',
                    'is_primary' => true,
                    'created_at' => $this->parseDate($row['created_at']),
                    'updated_at' => $this->parseDate($row['updated_at']),
                ]);
            }
        }
    }

    protected function migrateClinicalData()
    {
        $this->command->info('Migrating Clinical Data (Optimized: Smart Status & Debt Detection)...');
        
        $companyId = 2;
        $branch = Branch::where('company_id', $companyId)->where('is_main', true)->first();
        $branchId = $branch ? $branch->id : 1;
        $today = now()->startOfDay();

        // 1. Applications -> Treatments
        $appRows = $this->parseSqlFile('applications_202602041814.sql', 'applications', [
            'id', 'derivado', 'desde', 'comments', 'user_id', 'status', 'type_value', 'type_payment', 'created_at', 'updated_at', 'patient_id'
        ]);

        $treatmentsMap = [];
        foreach ($appRows as $row) {
            $oldAppId = $row['id'];
            $oldPatientId = $row['patient_id'];
            $patient = $this->migratedPatientsMap[$oldPatientId] ?? null;
            if (!$patient) continue;

            // SMART STATUS: 1 means Active/In Progress, 0 means Cancelled
            $status = $row['status'] == 1 ? TreatmentStatusEnum::IN_PROGRESS : TreatmentStatusEnum::CANCELLED;

            $treatment = Treatment::create([
                'patient_id' => $patient->id,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'session_type_id' => SessionType::first()->id ?? 1,
                'description' => $row['comments'] ?: 'Tratamiento Migrado',
                'status' => $status,
                'start_date' => $this->parseDate($row['created_at'], true),
                'total_sessions' => 10,
                'completed_sessions' => 0,
                'created_at' => $this->parseDate($row['created_at']),
            ]);
            $treatmentsMap[$oldAppId] = $treatment;
        }

        // 2. Prepare Payments data
        $paymentRows = $this->parseSqlFile('payment_incomes_202602041815.sql', 'payment_incomes', [
            'id', 'pay', 'application_id', 'apply_item_id', 'created_at', 'updated_at', 'fecha_pago', 'status', 'type', 'file', 'saldo', 'mensaje'
        ]);
        
        $paymentsByItemId = [];
        foreach ($paymentRows as $pay) {
            $itemId = $pay['apply_item_id'];
            if ($itemId) {
                $paymentsByItemId[$itemId] = $pay;
            }
        }

        // 3. Apply Items -> Sessions
        $itemRows = $this->parseSqlFile('apply_items_202602041814.sql', 'apply_items', [
            'id', 'user_id', 'application_id', 'status', 'fecha_atencion', 'comments', 'created_at', 'updated_at', 
            'application_type_id', 'price', 'numero_sesion', 'application_type_user_id', 'doctor_id', 'patient_id', 'estado_pago'
        ]);

        foreach ($itemRows as $item) {
            $oldItemId = $item['id']; 
            $oldAppId = $item['application_id'];
            $treatment = $treatmentsMap[$oldAppId] ?? null;
            if (!$treatment) continue;

            $doctor = $this->migratedDoctorsMap[$item['doctor_id']] ?? null;
            $fallbackDoctorId = !empty($this->migratedDoctorsMap) ? reset($this->migratedDoctorsMap)->id : 1;

            $price = floatval($item['price']);
            $date = $this->parseDate($item['fecha_atencion'] ?: $item['created_at']);
            
            // SMART SESSION STATUS
            $status = AppointmentStatusEnum::CANCELLED;
            if ($item['status'] == 1) {
                $status = $date->gte($today) ? AppointmentStatusEnum::SCHEDULED : AppointmentStatusEnum::COMPLETED;
            }

            $sessionTypeId = $this->sessionTypesMap[$item['application_type_id']] ?? (SessionType::first()->id ?? 1);
            $doctorAmount = round($price * 0.5);

            $session = TreatmentSession::create([
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'treatment_id' => $treatment->id,
                'patient_id' => $treatment->patient_id,
                'doctor_id' => $doctor ? $doctor->id : $fallbackDoctorId, 
                'session_type_id' => $sessionTypeId,
                'date' => $date,
                'time' => $this->parseDate($item['created_at']), 
                'status' => $status,
                'patient_amount_clp' => $price,
                'doctor_amount_clp' => $doctorAmount, 
                'clinic_amount_clp' => $price - $doctorAmount,
                'created_at' => $this->parseDate($item['created_at']),
                'updated_at' => $this->parseDate($item['updated_at']),
                'subjective' => $item['comments'], 
                'month_session_number' => $item['numero_sesion'],
            ]);

            if ($status === AppointmentStatusEnum::COMPLETED) {
                $treatment->increment('completed_sessions');
            }

            // --- SMART FINANCIAL LOGIC ---
            $payInfo = $paymentsByItemId[$oldItemId] ?? null;
            $paidAmount = $payInfo ? floatval($payInfo['pay']) : 0;
            $isPaidLegacy = isset($item['estado_pago']) && $item['estado_pago'] == 1;

            if ($isPaidLegacy || ($paidAmount >= $price && $price > 0)) {
                // SESIÓN TOTALMENTE PAGADA
                $finalPayAmount = $paidAmount > 0 ? $paidAmount : $price;
                
                $payment = Payment::create([
                    'uuid' => Str::uuid()->toString(),
                    'company_id' => $companyId,
                    'branch_id' => $branchId,
                    'user_id' => 1,
                    'patient_id' => $treatment->patient_id,
                    'amount_clp' => $finalPayAmount,
                    'payment_method' => \App\Enums\PaymentMethodEnum::TRANSFER,
                    'payment_date' => $payInfo ? $this->parseDate($payInfo['created_at']) : $session->date,
                    'paid_at' => $payInfo ? $this->parseDate($payInfo['created_at']) : $session->date,
                    'status' => 'completed',
                    'transaction_reference' => $payInfo ? 'MIGRACION-' . $payInfo['id'] : 'AJUSTE-HISTORICO',
                    'created_at' => $session->created_at,
                ]);

                PaymentAllocation::create([
                    'company_id' => $companyId,
                    'payment_id' => $payment->id,
                    'treatment_session_id' => $session->id,
                    'amount_clp' => $finalPayAmount,
                ]);
            } else {
                // SESIÓN CON DEUDA (UNPAID o PARTIAL)
                $financeStatus = ($paidAmount > 0 && $paidAmount < $price) ? FinanceStatusEnum::PARTIAL : FinanceStatusEnum::UNPAID;

                $invoice = Invoice::create([
                    'company_id' => $companyId,
                    'branch_id' => $branchId,
                    'user_id' => 1,
                    'patient_id' => $treatment->patient_id,
                    'entity_type' => Patient::class,
                    'entity_id' => $treatment->patient_id,
                    'total_amount_clp' => $price,
                    'amount_patient_clp' => $price,
                    'exempt_amount_clp' => $price,
                    'payment_status' => $financeStatus,
                    'dte_status' => \App\Enums\DteStatusEnum::PENDING, 
                    'issue_date' => $session->date,
                    'created_at' => $session->created_at,
                ]);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'company_id' => $companyId,
                    'branch_id' => $branchId,
                    'treatment_session_id' => $session->id,
                    'description' => 'Sesión Kinesiología #' . $item['numero_sesion'],
                    'quantity' => 1,
                    'unit_price_clp' => $price,
                    'unit_patient_clp' => $price, 
                    'total_gross_clp' => $price,
                    'total_patient_clp' => $price,
                ]);

                if ($paidAmount > 0) {
                    $payment = Payment::create([
                        'uuid' => Str::uuid()->toString(),
                        'company_id' => $companyId,
                        'branch_id' => $branchId,
                        'user_id' => 1,
                        'patient_id' => $treatment->patient_id,
                        'amount_clp' => $paidAmount,
                        'payment_method' => \App\Enums\PaymentMethodEnum::TRANSFER,
                        'payment_date' => $this->parseDate($payInfo['created_at']),
                        'paid_at' => $this->parseDate($payInfo['created_at']),
                        'status' => 'completed',
                        'transaction_reference' => 'MIGRACION-PARCIAL-' . $payInfo['id'],
                        'created_at' => $session->created_at,
                    ]);

                    PaymentAllocation::create([
                        'company_id' => $companyId,
                        'payment_id' => $payment->id,
                        'invoice_id' => $invoice->id,
                        'treatment_session_id' => $session->id,
                        'amount_clp' => $paidAmount,
                    ]);
                }
            }
        }
    }

    protected function migrateAssignments()
    {
        $this->command->info('Migrating Doctor-Patient Assignments...');
        $rows = $this->parseSqlFile('paciente_kines_202602041817.sql', 'paciente_kines', [
            'id', 'doctor_id', 'patient_id', 'created_at', 'updated_at'
        ]);

        $companyId = 2;
        $branch = Branch::where('company_id', $companyId)->where('is_main', true)->first();
        $branchId = $branch ? $branch->id : 2;

        foreach ($rows as $row) {
            $oldDocId = $row['doctor_id'];
            $oldPatId = $row['patient_id'];

            $doctor = $this->migratedDoctorsMap[$oldDocId] ?? null;
            $patient = $this->migratedPatientsMap[$oldPatId] ?? null;

            if ($doctor && $patient) {
                DoctorPatientAssignment::firstOrCreate([
                    'doctor_id' => $doctor->id,
                    'patient_id' => $patient->id,
                ], [
                    'company_id' => $companyId,
                    'branch_id' => $branchId, 
                    'role' => 'therapist',
                    'is_primary' => true,
                    'started_at' => $this->parseDate($row['created_at']),
                    'created_at' => $this->parseDate($row['created_at']),
                ]);
            }
        }
    }

    private function parseSqlFile($filename, $tableName, $columns)
    {
        $path = base_path('old-db/' . $filename);
        if (!file_exists($path)) {
            $this->command->warn("File not found: $filename");
            return [];
        }

        $content = file_get_contents($path);
        $content = str_replace("\r\n", "\n", $content);
        
        $data = [];

        $pattern = '/INSERT INTO public\.' . $tableName . '.*?\sVALUES\s*(.*?);/si';
        
        preg_match_all($pattern, $content, $matches);
        
        if (empty($matches[1])) {
             $this->command->warn("No INSERTs found for $tableName in $filename");
             return [];
        }

        foreach ($matches[1] as $valuesBlock) {
            $valuesBlock = trim($valuesBlock);
            $rows = preg_split('/\),\s*\(/', $valuesBlock);
            
            foreach ($rows as $rowStr) {
                $rowStr = trim($rowStr);
                $rowStr = ltrim($rowStr, '(');
                $rowStr = rtrim($rowStr, ')');
                
                $values = str_getcsv($rowStr, ",", "'");
                
                if (count($values) >= count($columns)) {
                    $mapped = [];
                    foreach ($columns as $idx => $col) {
                        $val = isset($values[$idx]) ? $values[$idx] : null;
                        if ($val === 'NULL') $val = null;
                        $mapped[$col] = $val;
                    }
                    $data[] = $mapped;
                }
            }
        }
        
        return $data;
    }

    private function parseDate($dateStr, $onlyDate = false)
    {
        if (!$dateStr || $dateStr === 'NULL') return $onlyDate ? now()->toDateString() : now();
        try {
            $c = Carbon::parse($dateStr);
            if ($c->year < 1900) {
                $c->year = 2000 + ($c->year % 100); 
                if ($c->year > 2050) $c = now();
            }
            return $onlyDate ? $c->toDateString() : $c;
        } catch (\Exception $e) {
            return now();
        }
    }
}
