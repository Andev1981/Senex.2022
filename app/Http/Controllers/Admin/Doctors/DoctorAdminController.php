<?php

namespace App\Http\Controllers\Admin\Doctors;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Commune;
use App\Models\Doctor;
use App\Models\DoctorCommissionRate;
use App\Models\DoctorPatientAssignment;
use App\Models\Patient;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;


class DoctorAdminController extends Controller
{

    public function index(Request $request)
    {
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');

        // --- 0. Gestión de Fechas (Filtros) ---
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // --- 1. Obtener el "Catálogo Maestro" de Sesiones ---
        $sessionTypes = SessionType::where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->get(['id', 'name', 'base_price_clp', 'default_doctor_commission_clp']);

        // --- 2. Query de Doctores ---
        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', 'Doctor')
            ->groupBy('a.addressable_id');

        $doctors = Doctor::query()
            ->where('doctors.company_id', $currentCompanyId)
            ->leftJoinSub($addrPick, 'addr_pick', function ($join) {
                $join->on('addr_pick.addressable_id', '=', 'doctors.id');
            })
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes', 'addr.commune_id', '=', 'communes.id')
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                $query->whereHas('branches', function ($q) use ($activeBranchId) {
                    $q->where('branches.id', $activeBranchId);
                });
            })
            ->select([
                'doctors.*',
                DB::raw("CONCAT_WS(' ', doctors.name, doctors.last_name) as full_name"),
                'addr.street as street',
                'addr.number as number',
                'addr.details as details',
                'addr.commune_id as commune_id',
                'addr.province_id as province_id',
                'addr.region_id as region_id',
                'communes.name as sql_commune_name',
                DB::raw("CONCAT_WS(' ', addr.street, addr.number) as sql_full_address"),
            ])
            ->with(['commissionRates' => function ($q) use ($currentCompanyId) {
                $q->where('company_id', $currentCompanyId);
            }])
            ->with(['branches'])
            ->get();

        // --- 3. Transformación de Datos & Estadísticas ---
        $doctors->transform(function ($doctor) use ($sessionTypes, $month, $year) {
            $doctor->comuna_name = $doctor->sql_commune_name;
            $doctor->full_address = $doctor->sql_full_address . ' ' . ($doctor->sql_commune_name ?? '');

            $customRates = $doctor->commissionRates->keyBy('session_type_id');
            $currentBranch = $doctor->branches->first();

            $doctor->branch_status = $currentBranch ? $currentBranch->pivot->status : 'unassigned';
            $doctor->branch_status_reason = $currentBranch ? $currentBranch->pivot->status_reason : '';
            $doctor->mobile_app_access = $currentBranch ? (bool)$currentBranch->pivot->mobile_app_access : false;

            // --- CÁLCULO DE ESTADÍSTICAS DEL MES SELECCIONADO ---
            $sessions = $doctor->sessions()
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();

            $doctor->sessions_month = $sessions->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)->count();
            $doctor->revenue_month = $sessions->where('status', \App\Enums\AppointmentStatusEnum::COMPLETED)->sum('doctor_amount_clp');
            $doctor->pending_sessions_count = $sessions->where('status', \App\Enums\AppointmentStatusEnum::SCHEDULED)->count();
            
            // Para compatibilidad con CamelCase en Kpis.jsx
            $doctor->sessionsMonth = $doctor->sessions_month;
            $doctor->revenueMonth = $doctor->revenue_month;

            unset($doctor->branches);

            $doctor->rates_summary = $sessionTypes->map(function ($st) use ($customRates) {
                $custom = $customRates->get($st->id);
                return [
                    'session_type_id' => $st->id,
                    'name' => $st->name,
                    'price_to_patient' => $st->base_price_clp ?? 0,
                    'current_value' => $custom ? $custom->amount_clp : $st->default_doctor_commission_clp,
                    'default_value' => $st->default_doctor_commission_clp,
                    'is_customized' => (bool) $custom,
                    'commission_type' => $custom ? $custom->commission_type : 'fixed_amount'
                ];
            });

            return $doctor;
        });

        $patients = Patient::where('company_id', $currentCompanyId)->where('status', 'active')->get();
        $provinces = Province::all(['id', 'name', 'region_id']);
        $communes  = Commune::all(['id', 'name', 'province_id']);
        $regions   = Region::all(['id', 'name']);

        return Inertia::render('doctors/Index', [
            'doctors' => $doctors,
            'sessionTypes' => $sessionTypes,
            'patients' => $patients,
            'communes' => $communes,
            'provinces' => $provinces,
            'regions' => $regions,
            'filters' => [
                'month' => (int)$month,
                'year' => (int)$year
            ],
            'user' => auth()->user()->load('roles'),
        ]);
    }
    public function store(StoreDoctorRequest $request)
    {

        $validated = $request->validated();

        DB::beginTransaction();

        try {

            // CREAR USUARIO
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['rut']),
                'email_verified_at' => now(), // Auto-verificado
            ]);

            $user->assignRole('kine');

            // Separar datos del paciente y la dirección
            $doctorData = Arr::except($validated, [
                'street',
                'number',
                'details',
                'region_id',
                'province_id',
                'commune_id'
            ]);

            $addressData = Arr::only($validated, [
                'street',
                'number',
                'details',
                'region_id',
                'province_id',
                'commune_id'
            ]);

            $doctorData['user_id'] = $user->id;

            $doctor = Doctor::create($doctorData);

            // Crear dirección asociada polimórficamente
            $doctor->addresses()->create([
                'type' => 'home',
                'is_primary' => true,
                'country' => 'Chile',
                ...$addressData
            ]);

            // ENVIAR EMAIL CON CREDENCIALES
            try {
                Mail::to($user->email)->send(
                    new \App\Mail\WelcomeKineEmail($user, temporalPassword: $validated['rut'])
                );
            } catch (\Exception $e) {
                Log::warning('Error enviando email de bienvenida', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                // No fallar la creación si falla el email
            }

            /* Log::info('Datos al crear kine: ', [
                $doctor, $user
            ]); */

            DB::commit();

            session()->flash('message', 'Kine cread@ correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::info('Error al crear kine: ', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al crear kine.');
            session()->flash('type', 'error');
        }
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor)
    {

        $activeBranchId = session('active_branch_id');
        $validated = $request->validated();

        DB::beginTransaction();

        try {

            // -------------------------------
            // Separar datos
            // -------------------------------
            $doctorData = Arr::only($validated, [
                'name',
                'last_name',
                'rut',
                'email',
                'phone',
                'speciality',
                'birth_date',
                'gender'
            ]);


            $addressData = Arr::only($validated, [
                'street',
                'number',
                'details',
                'region_id',
                'province_id',
                'commune_id'
            ]);

            if ($validated['status'] !== 'active') {
                $validated['mobile_app_access'] = false;
            }

            $branchData = Arr::only($validated, [
                'mobile_app_access',
                'status',
                'status_reason'
            ]);


            // 🎯 LA MAGIA: syncWithoutDetaching permite pasar datos adicionales
            // Si no existe, lo crea con esos datos. Si ya existe, NO borra los otros sedes.
            $doctor->branches()->syncWithoutDetaching([
                $activeBranchId => $branchData
            ]);

            if (!$doctor->user->hasRole('kine')) {
                // Evitar cambiar email de kinesiologo
                $doctor->user->assignRole('kine');
            }
            // -------------------------------
            // 1. Lógica de CAMBIO DE STATUS
            // -------------------------------
            if (array_key_exists('status', $branchData)) {

                $newStatus = $validated['status'];
                $oldStatus = $doctor->status;

                // ¿El estado realmente cambió?
                if ($newStatus !== $oldStatus) {


                    $branchData['status_changed_at'] = now();


                    if ($newStatus !== 'active') {

                        if (empty($validated['status_reason'])) {
                            throw new \Exception("Debe ingresar un motivo cuando el estado no es activo.");
                        }

                        $branchData['status_reason'] = $validated['status_reason'];
                    }


                    if ($newStatus === 'active') {
                        $branchData['status_reason'] = null;
                    }
                } else {

                    unset($branchData['status']);
                }
            }

            // -------------------------------
            // 2. Actualizar Tabla pivot
            // -------------------------------
            $doctor->branches()->updateExistingPivot($activeBranchId, $branchData);

            // -------------------------------
            // 3. Actualizar doctor
            // -------------------------------
            $doctor->update($doctorData);

            // -------------------------------
            // 4. Actualizar / crear dirección
            // -------------------------------
            $address = $doctor->addresses()->first();

            if ($address) {
                $address->update($addressData);
            } elseif (!empty($addressData)) {
                $doctor->addresses()->create([
                    'type' => 'home',
                    'is_primary' => true,
                    'country' => 'Chile',
                    ...$addressData
                ]);
            }

            DB::commit();

            session()->flash('message', 'Kine actualizad@ correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::info('Error al actualizar kine', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al actualizar kine.');
            session()->flash('type', 'error');
        }
    }

    public function updateCommissionRules(Request $request, Doctor $doctor)
    {
        // 1. Validación (Value ahora es nullable para permitir borrar/heredar)
        $validated = $request->validate([
            'rules' => 'required|array',
            'rules.*.session_type_id' => 'required|exists:session_types,id',
            'rules.*.type' => 'required|in:fixed_amount,percentage',
            'rules.*.value' => 'nullable|numeric|min:0', // Nullable para permitir "borrar"
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['rules'] as $rule) {
                // Si el valor es NULL, significa que el usuario borró el input.
                // Borramos la excepción para que vuelva a heredar el valor global.
                if (is_null($rule['value'])) {
                    $doctor->commissionRates()
                        ->where('session_type_id', $rule['session_type_id'])
                        ->delete();
                } else {
                    // Si hay valor, actualizamos o creamos la excepción (Upsert)
                    $doctor->commissionRates()->updateOrCreate(
                        [
                            'session_type_id' => $rule['session_type_id'],
                        ],
                        [
                            'commission_type'  => $rule['type'],
                            'amount_clp' => $rule['value'],
                            // Estos campos extras no suelen ir aquí si ya están en session_types, 
                            // pero los dejo por compatibilidad con tu código:
                            'effective_from'   => now(),
                        ]
                    );
                }
            }

            DB::commit();

            // --- CLAVE DEL ÉXITO ---
            // Recalculamos el 'rates_summary' aquí mismo para devolverlo al frontend.
            // Esto asegura que el frontend reciba la verdad absoluta de la BD.
            $companyId = $doctor->company_id;
            $sessionTypes = SessionType::where('company_id', $companyId)
                ->where('is_active', true)
                ->get(['id', 'name', 'base_price_clp', 'default_doctor_commission_clp']);

            $customRates = $doctor->commissionRates()->get()->keyBy('session_type_id');

            $updatedSummary = $sessionTypes->map(function ($st) use ($customRates) {
                $custom = $customRates->get($st->id);
                return [
                    'session_type_id' => $st->id,
                    'name' => $st->name,
                    'price_to_patient' => $st->base_price_clp, // ARREGLO VISUAL: Aseguramos que este campo viaje
                    'current_value' => $custom ? $custom->amount_clp : $st->default_doctor_commission_clp, // Ojo: amount_clp vs amount_clp según tu BD
                    'default_value' => $st->default_doctor_commission_clp,
                    'is_customized' => (bool) $custom,
                    'commission_type' => $custom ? $custom->commission_type : 'fixed_amount'
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Tarifas actualizadas correctamente',
                'updated_summary' => $updatedSummary
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error updating commissions: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al guardar'], 500);
        }
    }

    public function assignPatient(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id'); // Puede ser null

        try {
            // Datos extra para la tabla pivote (company_id, branch_id, timestamps, etc.)
            $pivotData = [
                'company_id' => $currentCompanyId,
                'branch_id' => $activeBranchId,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // ⚡ OPTIMIZACIÓN: syncWithoutDetaching
            // Esto hace lo mismo que tu "if exists", pero en una sola línea.
            // Si ya existe, no hace nada (o actualiza los datos pivote). Si no existe, lo crea.
            $doctor->patients()->syncWithoutDetaching([
                $validated['patient_id'] => $pivotData
            ]);

            // ✅ RESPUESTA JSON PARA AXIOS
            return response()->json([
                'success' => true,
                'message' => 'Paciente asignado correctamente'
            ]);
        } catch (\Throwable $e) {
            Log::error('Error al asignar paciente: ' . $e->getMessage());

            // ❌ ERROR JSON
            return response()->json([
                'success' => false,
                'message' => 'Error interno al asignar paciente.'
            ], 500);
        }
    }

    public function unassignPatient(Doctor $doctor, Patient $patient)
    {
        try {
            $doctor->patients()->detach($patient->id);

            // ✅ RESPUESTA JSON PARA AXIOS
            return response()->json([
                'success' => true,
                'message' => 'Asignación removida correctamente'
            ]);
        } catch (\Throwable $e) {
            Log::error('Error al quitar asignación: ' . $e->getMessage());

            // ❌ ERROR JSON
            return response()->json([
                'success' => false,
                'message' => 'Error al quitar asignación.'
            ], 500);
        }
    }

    public function toggleActive(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        try {


            $doctor->update(['is_active' => $validated['is_active']]);

            session()->flash('message', 'Kine Activad@');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {

            Log::info('Error al activar kine: ', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al activar.');
            session()->flash('type', 'error');
        }
    }

    public function checkExisting(Request $request)
    {
        $request->validate(['rut' => 'required']);
        $activeBranchId = session('active_branch_id');

        // El Trait Multitenantable ya filtra por la empresa actual, 
        // así que no necesitamos preocuparnos por otras clínicas.
        /* $doctor = Doctor::with('branch')->where('rut', $request->rut)->first(); */
        // El $addrPick está perfecto con el alias 'Doctor'
        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', 'Doctor')
            ->groupBy('a.addressable_id');

        $doctor = Doctor::query()
            // Filtramos por RUT y Empresa (asumo que tienes un scope global o un where)
            ->where('rut', $request->rut)
            // --- 🎯 LOS JOINS PARA TRAER LA DIRECCIÓN EN LA CONSULTA PRINCIPAL ---
            ->leftJoinSub($addrPick, 'addr_pick', function ($join) {
                $join->on('addr_pick.addressable_id', '=', 'doctors.id');
            })
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes', 'addr.commune_id', '=', 'communes.id')

            // --- 🎯 EL SELECT CRUCIAL ---
            ->select([
                'doctors.*', // 1. CRUCIAL: Trae todas las columnas del modelo Doctor para que 'with' funcione

                // 2. Trae las columnas de dirección con un alias que no colisione
                'addr.street as street',
                'addr.number as number',
                'addr.details as details',
                'addr.commune_id as commune_id',
                'addr.province_id as province_id',
                'addr.region_id as region_id',
                'communes.name as comuna_name',
            ])
            // 3. Eager Loading de la relación branches
            ->with([
                'branches' => function ($q) use ($activeBranchId) {
                    // Solo cargamos la información de la sucursal activa, si existe
                    $q->where('branches.id', $activeBranchId);
                }
            ])
            ->first();


        if ($doctor) {

            return response()->json([
                'status' => 'exists',
                'doctor' => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'last_name' => $doctor->last_name,
                    'email' => $doctor->email,
                    'phone' => $doctor->phone,
                    'birth_date' => $doctor->birth_date,
                    'gender' => $doctor->gender,
                    'speciality' => $doctor->speciality,
                    'mobile_app_access' => true,
                    'status' => "active",
                    'status_reason' => "",
                    'commune_id' => $doctor->commune_id,
                    'province_id' => $doctor->province_id,
                    'region_id' => $doctor->region_id,
                    'street' => $doctor->street,
                    'number' => $doctor->number,
                    'details' => $doctor->details,
                ]
            ]);
        }

        return response()->json(['status' => 'new']);
    }
}
