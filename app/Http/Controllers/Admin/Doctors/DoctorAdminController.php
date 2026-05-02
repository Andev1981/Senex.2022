<?php

namespace App\Http\Controllers\Admin\Doctors;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Doctor;
use App\Models\Item;
use App\Models\DoctorCommissionRate;
use App\Models\Patient;
use App\Models\Address;
use App\Models\Commune;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DoctorAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // 🎯 DETERMINAR CONTEXTO DE EMPRESA (Con fallback seguro)
        $currentCompanyId = session('current_company_id') ?: $user->company_id;
        if (!$currentCompanyId) {
            $currentCompanyId = Company::first()?->id;
        }

        // 🎯 DETERMINAR CONTEXTO DE SUCURSAL
        $activeBranchId = session('active_branch_id');
        
        // Validar que la sucursal activa pertenezca a la empresa actual
        if ($activeBranchId) {
            $branchExists = Branch::where('id', $activeBranchId)
                ->where('company_id', $currentCompanyId)
                ->exists();
            if (!$branchExists) {
                $activeBranchId = null;
            }
        }

        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // 1. Catálogo de servicios (para modal de configuración)
        $items = Item::services()
            ->where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->with('serviceDetail')
            ->get();

        // 2. Consulta principal de Doctores
        // Optimizamos la obtención de la dirección principal
        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', 'Doctor')
            ->groupBy('a.addressable_id');

        $doctors = Doctor::query()
            ->where('doctors.company_id', $currentCompanyId)
            ->leftJoin('users', 'users.id', '=', 'doctors.user_id')
            ->leftJoinSub($addrPick, 'addr_pick', function ($join) {
                $join->on('addr_pick.addressable_id', '=', 'doctors.id');
            })
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes', 'addr.commune_id', '=', 'communes.id')
            // Join con branch_doctor para obtener estatus en la sucursal actual (si hay una seleccionada)
            ->leftJoin('branch_doctor', function($join) use ($activeBranchId) {
                $join->on('branch_doctor.doctor_id', '=', 'doctors.id')
                    ->when($activeBranchId, fn($q) => $q->where('branch_doctor.branch_id', '=', $activeBranchId));
            })
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                $query->whereHas('branches', function ($q) use ($activeBranchId) {
                    $q->where('branches.id', $activeBranchId);
                });
            })
            ->select([
                'doctors.*',
                'users.email as user_email', 
                'communes.name as commune_name',
                'addr.street',
                'addr.number',
                'addr.details',
                'addr.commune_id',
                'addr.region_id',
                'addr.province_id',
                'addr.id as address_id',
                'branch_doctor.status as branch_status',
                'branch_doctor.mobile_app_access',
                'branch_doctor.status_reason as branch_status_reason'
            ])
            ->with(['branches:id,name', 'commissionRates', 'user:id,is_active,email'])
            ->get()
            ->map(function($d) {
                // Aseguramos que el email no sea nulo para el frontend
                if (empty($d->email)) {
                    $d->email = $d->user_email;
                }
                // Fallback para estatus de sucursal si no hay branch activa seleccionada
                if (empty($d->branch_status)) {
                    $d->branch_status = $d->is_active ? 'active' : 'cancelled';
                }
                return $d;
            });

        // 3. Obtener datos geográficos
        $regions = Region::orderBy('name')->get(['id', 'name'])->map(fn($r) => ['value' => (string)$r->id, 'label' => $r->name]);
        $provinces = Province::orderBy('name')->get(['id', 'name', 'region_id'])->map(fn($p) => ['value' => (string)$p->id, 'label' => $p->name, 'region_id' => (string)$p->region_id]);
        $communes = Commune::orderBy('name')->get(['id', 'name', 'province_id'])->map(fn($c) => ['value' => (string)$c->id, 'label' => $c->name, 'province_id' => (string)$c->province_id]);
        
        // 4. Determinar Sucursales Disponibles
        if ($user->isSuperAdmin()) {
            $availableBranches = Branch::where('company_id', $currentCompanyId)
                ->select(['id', 'name'])->get();
        } else {
            $availableBranches = $user->branches()
                ->where('branches.company_id', $currentCompanyId)
                ->select(['branches.id', 'branches.name'])->get();
        }

        // 5. Disponibilidad y Salas Globales para la empresa actual
        $availabilities = \App\Models\Availability::where('company_id', $currentCompanyId)
            ->with(['branch', 'room'])
            ->get();
        
        $allRooms = \App\Models\Room::where('company_id', $currentCompanyId)->get();

        return Inertia::render('doctors/Index', [
            'doctors'   => $doctors,
            'items'     => $items,
            'regions'   => $regions,
            'provinces' => $provinces,
            'communes'  => $communes,
            'branches'  => $availableBranches,
            'availabilities' => $availabilities,
            'rooms' => $allRooms,
            'filters'   => [
                'month' => (int)$month,
                'year'  => (int)$year,
                'active_branch_id' => $activeBranchId
            ]
        ]);
    }

    public function show(Doctor $doctor)
    {
        $currentCompanyId = session('current_company_id');
        
        // 1. Cargar relaciones críticas
        $doctor->load(['user', 'branches', 'address.commune.province.region', 'commissionRates.item', 'patients']);

        // 2. Estadísticas Financieras (Últimos 6 meses para gráfico)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthSessions = $doctor->treatmentSessions()
                ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
                ->whereYear('date', $month->year)
                ->whereMonth('date', $month->month)
                ->get();

            $chartData[] = [
                'month' => $month->format('M'),
                'sessions' => $monthSessions->count(),
                'earnings' => (int) $monthSessions->sum('doctor_amount_clp'),
            ];
        }

        // 3. Montos por liquidar (Pendientes)
        $pendingEarnings = (int) $doctor->treatmentSessions()
            ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
            ->whereDoesntHave('payrollDetail')
            ->sum('doctor_amount_clp');

        $stats = [
            'total_sessions' => $doctor->treatmentSessions()->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)->count(),
            'month_sessions' => $doctor->treatmentSessions()
                ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
                ->whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->count(),
            'month_revenue' => (int) $doctor->treatmentSessions()
                ->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)
                ->whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->sum('doctor_amount_clp'),
            'pending_sessions' => $doctor->treatmentSessions()
                ->where('status', \App\Enums\AppointmentStatusEnum::SCHEDULED)
                ->where('date', '>=', now()->toDateString())
                ->count(),
            'chart_data' => $chartData,
            'pending_earnings' => $pendingEarnings,
        ];

        // 4. Últimas 10 sesiones (Formateadas para el frontend)
        $sessions = $doctor->treatmentSessions()
            ->with(['patient', 'item'])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'date' => $s->date->toDateString(),
                    'time' => $s->time->format('H:i'),
                    'status' => $s->status,
                    'doctor_amount_clp' => $s->doctor_amount_clp,
                    'session_type' => ['name' => $s->item->name],
                    'patient' => [
                        'name' => $s->patient->name,
                        'last_name' => $s->patient->last_name,
                    ],
                ];
            });

        // 5. Liquidaciones (Payrolls)
        $payrolls = \App\Models\Payroll::where('doctor_id', $doctor->id)
            ->orderBy('period_end', 'desc')
            ->limit(5)
            ->get();

        // 6. Lista de TODOS los pacientes de la empresa (para buscador de vinculación)
        $allPatients = Patient::where('company_id', $currentCompanyId)
            ->orderBy('name')
            ->get(['id', 'name', 'last_name', 'rut']);

        // 7. Catálogo de servicios (Formateado para DoctorConfig)
        $items = Item::services()
            ->where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->with('serviceDetail')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (int)$item->price,
                    'base_price_clp' => (int)$item->price,
                    'default_doctor_commission_clp' => (int)($item->serviceDetail?->default_doctor_commission_clp ?? 0)
                ];
            });

        // 8. Datos geográficos
        $regions = Region::orderBy('name')->get(['id', 'name'])->map(fn($r) => ['value' => (string)$r->id, 'label' => $r->name]);
        $provinces = Province::orderBy('name')->get(['id', 'name', 'region_id'])->map(fn($p) => ['value' => (string)$p->id, 'label' => $p->name, 'region_id' => (string)$p->region_id]);
        $communes = Commune::orderBy('name')->get(['id', 'name', 'province_id'])->map(fn($c) => ['value' => (string)$c->id, 'label' => $c->name, 'province_id' => (string)$c->province_id]);

        // 9. Sucursales disponibles para edición
        $user = auth()->user();
        if ($user->isSuperAdmin()) {
            $availableBranches = Branch::where('company_id', $currentCompanyId)
                ->select(['id', 'name'])->get();
        } else {
            $availableBranches = $user->branches()
                ->where('branches.company_id', $currentCompanyId)
                ->select(['branches.id', 'branches.name'])->get();
        }

        $activeBranchId = session('active_branch_id');
        $currentBranchPivot = $doctor->branches->where('id', $activeBranchId)->first()?->pivot;

        // 10. Disponibilidad y Salas
        $availabilities = \App\Models\Availability::where('doctor_id', $doctor->id)
            ->with(['branch', 'room'])
            ->get();
        
        $allAvailabilities = \App\Models\Availability::where('company_id', $currentCompanyId)
            ->with(['doctor', 'branch', 'room'])
            ->get();
        
        $allRooms = \App\Models\Room::where('company_id', $currentCompanyId)->get();

        return Inertia::render('doctors/DetailDoctor', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'last_name' => $doctor->last_name,
                'rut' => $doctor->rut,
                'email' => $doctor->email ?: $doctor->user?->email,
                'phone' => $doctor->phone,
                'speciality' => $doctor->speciality,
                'is_active' => $doctor->is_active,
                'license_number' => $doctor->license_number,
                'commission_rates' => $doctor->commissionRates,
                'patients' => $doctor->patients,
                'branches' => $doctor->branches,
                'user' => $doctor->user,
                'comuna_name' => $doctor->address?->commune?->name,
                'address' => $doctor->address,
                'region_id' => $doctor->address?->region_id ?: $doctor->address?->commune?->province?->region_id,
                'province_id' => $doctor->address?->province_id ?: $doctor->address?->commune?->province_id,
                'commune_id' => $doctor->address?->commune_id,
                'street' => $doctor->address?->street,
                'number' => $doctor->address?->number,
                'details' => $doctor->address?->details,
                'mobile_app_access' => (bool) ($currentBranchPivot?->mobile_app_access ?? false),
                'branch_status' => $currentBranchPivot?->status ?? 'active',
                'branch_status_reason' => $currentBranchPivot?->status_reason ?? '',
            ],
            'stats' => $stats,
            'sessions' => $sessions,
            'payrolls' => $payrolls,
            'patients' => $allPatients,
            'session_types' => $items,
            'regions' => $regions,
            'provinces' => $provinces,
            'communes' => $communes,
            'branches' => $availableBranches,
            'availabilities' => $availabilities,
            'all_availabilities' => $allAvailabilities,
            'rooms' => $allRooms,
        ]);
    }

    public function updateCommissionRules(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'rules' => 'required|array',
            'rules.*.item_id' => 'required|exists:items,id',
            'rules.*.commission_type' => 'required|in:fixed_amount,percentage',
            'rules.*.amount_clp' => 'required_if:rules.*.commission_type,fixed_amount|nullable|numeric',
            'rules.*.commission_percentage' => 'required_if:rules.*.commission_type,percentage|nullable|numeric|min:0|max:100',
        ]);

        DB::transaction(function () use ($doctor, $validated) {
            $doctor->commissionRates()->delete();

            foreach ($validated['rules'] as $rule) {
                $doctor->commissionRates()->create([
                    'company_id'      => $doctor->company_id,
                    'item_id' => $rule['item_id'],
                    'commission_type' => $rule['commission_type'],
                    'amount_clp'      => $rule['amount_clp'] ?? 0,
                    'commission_percentage' => $rule['commission_percentage'] ?? 0,
                    'is_active'       => true,
                    'effective_from'  => now(),
                ]);
            }
        });

        return back()->with('success', 'Reglas de comisión actualizadas correctamente.');
    }

    public function assignPatient(Request $request, Doctor $doctor)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id'
        ]);

        $doctor->patients()->syncWithoutDetaching([$request->patient_id]);

        return back()->with('success', 'Paciente asignado correctamente.');
    }

    public function unassignPatient(Doctor $doctor, Patient $patient)
    {
        $doctor->patients()->detach($patient->id);

        return back()->with('success', 'Paciente desvinculado correctamente.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'rut' => 'required|string|max:12', // Quitamos unique aquí para manejarlo manualmente
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'speciality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string',
            'license_number' => 'nullable|string|max:50',
            'branches' => 'nullable|array',
            'branches.*' => 'exists:branches,id',
            'region_id' => 'nullable|exists:regions,id',
            'province_id' => 'nullable|exists:provinces,id',
            'commune_id' => 'nullable|exists:communes,id',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'details' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $companyId = session('current_company_id');
            $activeBranchId = session('active_branch_id');

            // 1. Verificar si existe globalmente
            $doctor = Doctor::withoutGlobalScopes()->where('rut', $validated['rut'])->first();

            if ($doctor) {
                // El doctor existe, lo actualizamos y vinculamos
                $doctor->update([
                    'name' => $validated['name'],
                    'last_name' => $validated['last_name'],
                    'phone' => $validated['phone'] ?? $doctor->phone,
                    'speciality' => $validated['speciality'] ?? $doctor->speciality,
                    'birth_date' => $validated['birth_date'] ?? $doctor->birth_date,
                    'gender' => $validated['gender'] ?? $doctor->gender,
                    'license_number' => $validated['license_number'] ?? $doctor->license_number,
                ]);
                $user = $doctor->user;
            } else {
                // No existe, creamos todo
                // Validar email único global si es nuevo
                $request->validate(['email' => 'unique:users,email']);

                $user = \App\Models\User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => bcrypt(Str::random(12)),
                    'company_id' => $companyId,
                ]);
                $user->assignRole('kine');

                $doctor = Doctor::create([
                    'company_id' => $companyId,
                    'user_id' => $user->id,
                    'name' => $validated['name'],
                    'last_name' => $validated['last_name'],
                    'rut' => $validated['rut'],
                    'phone' => $validated['phone'] ?? null,
                    'speciality' => $validated['speciality'] ?? null,
                    'birth_date' => $validated['birth_date'] ?? null,
                    'gender' => $validated['gender'] ?? null,
                    'license_number' => $validated['license_number'] ?? null,
                    'is_active' => true,
                ]);
            }

            // 2. Asignar Sucursales (Garantizar al menos la actual si el admin tiene scope limitado)
            $branchesToSync = $validated['branches'] ?? [];
            if (empty($branchesToSync) && $activeBranchId) {
                $branchesToSync = [$activeBranchId];
            }
            
            // Usamos syncWithoutDetaching para no borrar asociaciones de otras empresas si fuera el caso
            $doctor->branches()->syncWithoutDetaching($branchesToSync);

            // 3. Dirección (Se guarda siempre que haya al menos una comuna o calle)
            if (!empty($validated['commune_id']) || !empty($validated['street'])) {
                Address::updateOrCreate(
                    ['addressable_type' => 'Doctor', 'addressable_id' => $doctor->id],
                    [
                        'region_id' => $validated['region_id'] ?? null,
                        'province_id' => $validated['province_id'] ?? null,
                        'commune_id' => $validated['commune_id'] ?? null,
                        'street' => $validated['street'] ?? null,
                        'number' => $validated['number'] ?? null,
                        'details' => $validated['details'] ?? null,
                        'is_primary' => true,
                    ]
                );
            }

            return back()->with('success', 'Profesional gestionado correctamente en la sucursal.');
        });
    }

    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'rut' => 'required|string|max:12|unique:doctors,rut,' . $doctor->id,
            'email' => 'required|email|max:100|unique:users,email,' . $doctor->user_id,
            'phone' => 'nullable|string|max:20',
            'speciality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string',
            'license_number' => 'nullable|string|max:50',
            'branches' => 'nullable|array',
            'branches.*' => 'exists:branches,id',
            'region_id' => 'nullable|exists:regions,id',
            'province_id' => 'nullable|exists:provinces,id',
            'commune_id' => 'nullable|exists:communes,id',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'details' => 'nullable|string|max:255',
            'is_active' => 'required|boolean'
        ]);

        return DB::transaction(function () use ($doctor, $validated) {
            // 1. Actualizar Doctor
            $doctor->update([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'rut' => $validated['rut'],
                'phone' => $validated['phone'] ?? null,
                'speciality' => $validated['speciality'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'is_active' => $validated['is_active'],
            ]);

            // 2. Actualizar Usuario vinculado
            $doctor->user()->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'is_active' => $validated['is_active']
            ]);

            // 3. Sincronizar Sucursales
            if (!empty($validated['branches'])) {
                $doctor->branches()->sync($validated['branches']);
            }

            // 4. Actualizar Dirección (Se guarda siempre que haya al menos una comuna o calle)
            if (!empty($validated['commune_id']) || !empty($validated['street'])) {
                Address::updateOrCreate(
                    ['addressable_type' => 'Doctor', 'addressable_id' => $doctor->id],
                    [
                        'region_id' => $validated['region_id'] ?? null,
                        'province_id' => $validated['province_id'] ?? null,
                        'commune_id' => $validated['commune_id'] ?? null,
                        'street' => $validated['street'] ?? null,
                        'number' => $validated['number'] ?? null,
                        'details' => $validated['details'] ?? null,
                        'is_primary' => true
                    ]
                );
            }

            return back()->with('success', 'Ficha de profesional actualizada.');
        });
    }

    public function checkExisting(Request $request)
    {
        $rut = $request->input('rut');
        $doctor = Doctor::withoutGlobalScopes()->where('rut', $rut)->first();

        if ($doctor) {
            // Cargar dirección y comuna si existen
            $doctor->load(['address', 'user']);
            
            return response()->json([
                'status' => 'exists',
                'doctor' => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'last_name' => $doctor->last_name,
                    'email' => $doctor->email ?: $doctor->user?->email,
                    'phone' => $doctor->phone,
                    'speciality' => $doctor->speciality,
                    'birth_date' => $doctor->birth_date ? $doctor->birth_date->toDateString() : null,
                    'gender' => $doctor->gender,
                    'region_id' => $doctor->address?->region_id,
                    'province_id' => $doctor->address?->province_id,
                    'commune_id' => $doctor->address?->commune_id,
                    'street' => $doctor->address?->street,
                    'number' => $doctor->address?->number,
                    'details' => $doctor->address?->details,
                    'company_name' => $doctor->company->business_name ?? 'Otra Empresa'
                ]
            ]);
        }

        return response()->json(['status' => 'not_found']);
    }
}
