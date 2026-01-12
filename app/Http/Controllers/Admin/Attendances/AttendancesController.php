<?php

namespace App\Http\Controllers\Admin\Attendances;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Models\Doctor;
use App\Models\DoctorCommissionRate;
use App\Models\Patient;
use App\Models\PatientPlan;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\Diagnostic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AttendancesController extends Controller
{
    /**
     * Muestra la vista principal de atenciones y sesiones
     */
    public function index(Request $request)
    {
        $companyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');

        try {
            // Obtener el primer día del mes actual (Ej: 2025-12-01)
            $inicioMes = now()->startOfMonth()->format('Y-m-d');

            // Obtener el último día del mes actual (Ej: 2025-12-31)
            $finMes = now()->endOfMonth()->format('Y-m-d');

            // 1. Si 'fecha_inicio' no existe en la Request, usa el primer día del mes.
            $fechaInicio = $request->input('fecha_inicio', $inicioMes);

            // 2. Si 'fecha_fin' no existe en la Request, usa el último día del mes.
            $fechaFin = $request->input('fecha_fin', $finMes);
            $estado = $request->input('estado', 'all');
            $query = $request->input('query', '');

            // Asegurar que fecha_inicio no sea mayor que fecha_fin
            if ($fechaInicio > $fechaFin) {
                /* Log::info('Swap de fechas detectado'); */
                $temp = $fechaInicio;
                $fechaInicio = $fechaFin;
                $fechaFin = $temp;
            }
            

            // Query base con relaciones
            $sessionsQuery = TreatmentSession::with([
                'patient',
                'doctor',
                'sessionType',
                'paymentAllocation',
                'dte',
            ])
                ->whereBetween('date', [$fechaInicio, $fechaFin])
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->select([
                    'id',
                    'treatment_id',
                    'patient_id',
                    'doctor_id',
                    'session_type_id',
                    'date',
                    'time',
                    'month_session_number',
                    'status',
                    'patient_amount_clp',
                    'doctor_amount_clp',
                    'duration',
                ]);

            // Filtro por estado
            if ($estado !== 'all') {
                $sessionsQuery->where('status', $estado);
            }

            // Filtro por búsqueda
            if (!empty($query)) {
                $sessionsQuery->whereHas('patient', function ($q) use ($query) {
                    $q->where(DB::raw("LOWER(CONCAT(name, ' ', last_name))"), 'like', '%' . strtolower($query) . '%')
                        ->orWhere('rut', 'like', "%{$query}%");
                })->orWhereHas('doctor', function ($q) use ($query) {
                    $q->where(DB::raw("LOWER(CONCAT(name, ' ', last_name))"), 'like', '%' . strtolower($query) . '%');
                });
            }

            // Filtro por sucursal (branch_id)
            if ($activeBranchId) {
                $sessionsQuery->whereHas('doctor', function ($q) use ($activeBranchId) {
                    $q->whereHas('branches', function ($q) use ($activeBranchId) {
                        $q->where('branches.id', $activeBranchId);
                    });
                });
            }

            $sessions = $sessionsQuery->orderBy('time', 'asc')->get();

            // Log de resultados
            Log::info('Total de sesiones encontradas: ' . $sessions->count());
            if ($sessions->count() > 0) {
                Log::info('Primera sesión: ', [
                    'id' => $sessions->first()->id,
                    'date' => $sessions->first()->date,
                    'time' => $sessions->first()->time,
                    'status' => $sessions->first()->status,
                ]);
            } else {
                Log::warning('⚠️ No se encontraron sesiones en el rango especificado');
            }


            // Transformar datos para el frontend
            $atenciones = $sessions->map(function ($session) {

                return [
                    'session_id' => $session->id,

                    // Información básica
                    'treatment_id' => $session->treatment_id,
                    'patient_id' => $session->patient_id, // Use ID directly from session for safety
                    'doctor_id' => $session->doctor_id,
                    'session_type_id' => $session->session_type_id,

                    // Nombres para mostrar (Null Safe)
                    'patient_full_name' => $session->patient?->full_name ?? 'Paciente no encontrado',
                    'patient_rut' => $session->patient?->rut ?? 'S/R',
                    'patient_phone' => $session->patient?->phone ?? '',
                    'doctor_full_name' => $session->doctor ? ($session->doctor->name . ' ' . $session->doctor->last_name) : 'Doctor no asignado',
                    'name_session_type' => $session->sessionType?->name ?? 'Tipo desconocido',
                    'session_type_base_price' => $session->sessionType?->base_price ?? 0,

                    // Fecha y hora
                    'date' => $session->date,
                    'formatted_date' => Carbon::parse($session->date)->format('d/m/Y'),
                    'time' => Carbon::parse($session->time)->format('H:i'),
                    'duration' => $session->duration,

                    // Estado
                    'status' => $session->status,
                    'dte_generated' => $session->dte_generated,

                    // Precios
                    'patient_amount_clp' => $session->patient_amount_clp,
                    'plan_session_value' => $session->plan_session_value ?? 0,

                    // Plan
                    'consumes_plan' => $session->consumes_plan,
                    'patient_plan_id' => $session->patient_plan_id,
                    'patient_plan' => $session->patientPlan ? [
                        'id' => $session->patientPlan->id,
                        'plan_name' => $session->patientPlan->plan->name,
                        'sessions_remaining' => $session->patientPlan->sessions_remaining,
                        'price' => $session->patientPlan->plan->price
                    ] : null,

                    // Datos clínicos
                    'pain_before' => $session->pain_before ?? 0,
                    'pain_after' => $session->pain_after ?? 0,
                    'rom_flexion' => $session->rom_flexion ?? '',
                    'rom_abduction' => $session->rom_abduction ?? '',
                    'rom_rotation' => $session->rom_rotation ?? '',
                    'techniques' => $session->techniques ?? [],
                    'exercises' => $session->exercises ?? [],
                    'notes' => $session->notes ?? '',
                    'homework' => $session->homework ?? '',
                    'next_goals' => $session->next_goals ?? '',


                    'month_session_number' => $session->month_session_number,

                    // Totales
                    'total_payment' => $session->paymentAllocations ? $session->paymentAllocations->sum('amount_clp') : 0,
                    'copay_clp' => $session->payment ? $session->payment->sum('copay_clp') : 0,
                    'duration' => $session->duration,
                    'dte' => $session->dte ? [
                        'id' => $session->dte->id,
                        'folio' => $session->dte->folio,
                        'type' => $session->dte->type,
                        'status' => $session->dte->estado_sii,
                    ] : null,
                ];
            });



            $kpis = [
                'total' => $sessions->count(),
                'completadas' => $sessions->where('status', 'completed')->count(),
                'pendientes' => $sessions->where('status', 'scheduled')->count(),
                'canceladas' => $sessions->where('status', 'cancelled')->count(),
                'totalCobrado' =>  $sessions->whereIn('status', ['completed', 'in_progress', 'scheduled'])
                    ->filter(fn($session) => $session->paymentAllocations !== null)
                    ->sum(function ($session) {
                        return $session->paymentAllocations->sum('amount_clp');
                    }) ?? 0,
                'totalPorCobrar' => $sessions->whereIn('status', ['scheduled', 'completed', 'in_progress'])
                    ->sum('patient_amount_clp'),
            ];



            $patients = Patient::select('id', 'name', 'last_name', 'rut')
                // Filtro por sucursal optimizado
                ->when($activeBranchId, fn($q) => $q->whereRelation('branches', 'branches.id', $activeBranchId))

                // Carga de planes con las columnas NECESARIAS para que funcionen las relaciones
                ->with(['activePlans' => function ($query) {
                    $query->active()
                        ->notExpired()
                        ->withSessionsRemaining()
                        // CRUCIAL: 'plan_id' y 'patient_id' son obligatorios para que Laravel arme la relación
                        ->select('id', 'patient_id', 'plan_id', 'sessions_included', 'sessions_used', 'expiry_date')
                        ->with('plan:id,name,code,description');
                }])
                ->get()
                // Mapeo seguro (Null Safe)
                ->map(fn($p) => [
                    'id' => $p->id,
                    'full_name' => $p->full_name, // Asumiendo que tienes un Accessor getFullNameAttribute
                    'name' => $p->name,
                    'last_name' => $p->last_name,
                    'rut' => $p->rut,
                    'active_plans' => $p->activePlans->map(fn($plan) => [
                        'patient_plans.id' => $plan->id,
                        'plan_id' => $plan->plan_id,

                        // --- AQUÍ ESTABA EL PROBLEMA ---
                        // Si $plan->plan es null, esto evita el error 500:
                        'plan_name' => $plan->plan?->name ?? 'Plan Desconocido',
                        'plan_code' => $plan->plan?->code ?? 'N/A',
                        'plan_description' => $plan->plan?->description ?? '',
                        // -------------------------------

                        'sessions_included' => $plan->sessions_included,
                        'sessions_used' => $plan->sessions_used,

                        // Asegúrate de que este accessor exista en PatientPlan
                        /*  'sessions_remaining' => $plan->sessions_included - $plan->session_used, */

                        'expiry_date' => $plan->expiry_date?->format('Y-m-d'),
                        'is_expired' => $plan->is_expired ?? false,
                        'is_exhausted' => $plan->is_exhausted ?? false,
                    ])->values(), // Limpia índices numéricos para JSON
                ])
                ->sortBy('full_name', SORT_NATURAL | SORT_FLAG_CASE) // Ordenamiento natural mejorado
                ->values(); // Re-indexa el array principal para React



            $doctors = Doctor::select('id', 'name', 'last_name', 'rut')
                ->when($activeBranchId, function ($query) use ($activeBranchId) {
                    $query->whereHas('branches', function ($q) use ($activeBranchId) {
                        $q->where('branches.id', $activeBranchId);
                    });
                })
                ->orderBy('name')
                ->get()
                ->map(function ($doctor) {
                    return [
                        'id' => $doctor->id,
                        'full_name' => $doctor->full_name,
                        'rut' => $doctor->rut,
                    ];
                });

            $session_types = SessionType::select('id', 'name', 'code', 'category', 'base_price_clp', 'plan_discount_clp')
                ->orderBy('name')
                ->get();
$diagnostics = Diagnostic::where('is_active', true)->orderBy('description')->get(['code', 'description']);

            return Inertia::render('Attendances/Index', [
                'atenciones' => $atenciones,
                'kpis' => $kpis,
                'filtros' => [
                    'fecha_inicio' => $fechaInicio,
                    'fecha_fin' => $fechaFin,
                    'estado' => $estado,
                    'query' => $query,
                ],
                'patients' => $patients,      // ← Agregar
                'doctors' => $doctors,        // ← Agregar
                'session_types' => $session_types, // ← Agregar
                'diagnostics' => $diagnostics
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar atenciones: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Attendances/Index', [
                'atenciones' => [],
                'kpis' => [
                    'total' => 0,
                    'completadas' => 0,
                    'pendientes' => 0,
                    'canceladas' => 0,
                    'totalCobrado' => 0,
                    'totalPorCobrar' => 0,
                ],
                'filtros' => [
                    'fecha_inicio' => now()->format('Y-m-d'),
                    'fecha_fin' => now()->format('Y-m-d'),
                    'estado' => 'all',
                    'query' => '',
                ],
                'patients' => [],
                'doctors' => [],
                'session_types' => [],
                'error' => 'Error al cargar las atenciones'
            ]);
        }
    }

    /**
     * Crear nueva sesión
     */
    public function store(StoreAttendanceRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // 🔍 VALIDACIÓN: Verificar que existe comisión asignada
            $doctor = Doctor::findOrFail($validated['doctor_id']);
            $sessionType = SessionType::findOrFail($validated['session_type_id']);

            $commissionRate = DoctorCommissionRate::active()
                ->forDoctor($validated['doctor_id'])
                ->forSessionType($validated['session_type_id'])
                ->validAt(Carbon::parse($validated['date']))
                ->first();

            if (!$commissionRate) {
                DB::rollBack();
                session()->flash('message', "⚠️ No hay comisión configurada para {$doctor->full_name} en sesiones de tipo '{$sessionType->name}'. " .
                    "Por favor, configure la comisión antes de agendar.");
                session()->flash('type', 'error');
                return back();
            }

            // Si la comisión existe pero no tiene valores
            if ($commissionRate->commission_type === 'percentage' && !$commissionRate->commission_percentage) {
                DB::rollBack();

                session()->flash('message',  "⚠️ La comisión de {$doctor->full_name} no tiene porcentaje asignado. " .
                    "Configure el valor antes de continuar.");
                session()->flash('type', 'error');

                return back();
            }

            if ($commissionRate->commission_type === 'fixed_amount' && !$commissionRate->fixed_commission) {
                DB::rollBack();

                session()->flash('message',  "⚠️ La comisión de {$doctor->full_name} no tiene monto fijo asignado. " .
                    "Configure el valor antes de continuar.");
                session()->flash('type', 'error');

                return back();
            }

            // ============================================
            // 1. Asignar paciente a doctor
            // ============================================
            $this->assignPatientToDoctor($validated['patient_id'], $validated['doctor_id']);

            // ============================================
            // 2. Buscar o crear tratamiento
            // ============================================
            $treatment = Treatment::firstOrCreate(
                [
                    'patient_id' => $validated['patient_id'],
                    'status' => 'in_progress',
                ],
                [
                    'doctor_id' => $validated['doctor_id'],
                    'status' => 'in_progress',
                    'session_type_id' => $validated['session_type_id'],
                    'start_date' => now(),
                ]
            );

            // 3. Calcular y guardar snapshot de comisión
            $validated['commission_amount_clp'] = $commissionRate->calculateCommission($validated['patient_amount_cl']);
            $validated['commission_percentage'] = $commissionRate->commission_percentage;
            $validated['commission_type'] = $commissionRate->commission_type;

            // ============================================
            // 4. Verificar y validar plan (si aplica)
            // ============================================
            $consumePlan = $validated['consume_plan'] ?? false;
            $patientPlan = null;

            if ($consumePlan) {
                if (!$validated['patient_plan_id']) {
                    DB::rollBack();
                    return back()->with('error', 'Debe seleccionar un plan para consumir');
                }

                // Buscar plan con scopes
                $patientPlan = PatientPlan::where('id', $validated['patient_plan_id'])
                    ->where('patient_id', $validated['patient_id'])
                    ->active()
                    ->notExpired()
                    ->withSessionsRemaining()
                    ->first();

                if (!$patientPlan) {
                    DB::rollBack();
                    return back()->with('error', 'El plan seleccionado no está disponible o ha expirado');
                }

                // Verificar que tenga sesiones disponibles
                if ($patientPlan->sessions_remaining <= 0) {
                    DB::rollBack();
                    return back()->with('error', 'El plan no tiene sesiones disponibles');
                }

                // Verificar tipos de sesión permitidos en el plan
                $plan = $patientPlan->plan;
                if ($plan->session_types) {
                    $allowedTypes = $plan->session_types; // Ya es array, no necesita json_decode

                    if (count($allowedTypes) > 0 && !in_array($validated['session_type_id'], $allowedTypes)) {
                        DB::rollBack();
                        return back()->with('error', '⚠️ El tipo de sesión seleccionado no está cubierto por este plan');
                    }
                }
            }

            if ($patientPlan) {
                Log::info("Plan válido para consumir", [
                    'patient_plan_id' => $patientPlan->id,
                    'plan_name' => $patientPlan->plan->name,
                    'sessions_remaining' => $patientPlan->sessions_remaining,
                ]);
            } else {
                Log::info("No se consumirá plan para esta sesión");
            }


            // ============================================
            // 4. Crear la sesión
            // ============================================
            $session = TreatmentSession::create([
                'treatment_id' => $treatment->id,
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'session_type_id' => $validated['session_type_id'],
                'date' => $validated['date'],
                'time' => $validated['time'],
                'duration' => $validated['duration'],
                'status' => $validated['status'],
                'month_session_number' => $treatment->sessions()
                    ->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year)
                    ->count() + 1,
                'consumes_plan' => $consumePlan,
                'patient_plan_id' => $patientPlan ? $patientPlan->id : null,
                'patient_amount_clp' => $validated['patient_amount_clp'],
                'doctor_amount_clp' => $commissionRate['commission_amount_clp'],
                'techniques' => $request->techniques ?? [],
                'exercises' => $request->exercises ?? [],
            ]);

            // ============================================
            // 5. Descontar sesión del plan
            // ============================================
            if ($consumePlan && $patientPlan) {
                $patientPlan->increment('sessions_used');

                // Refrescar para obtener el valor actualizado
                $patientPlan->refresh();

                Log::info("Sesión descontada del plan", [
                    'session_id' => $session->id,
                    'patient_plan_id' => $patientPlan->id,
                    'plan_name' => $patientPlan->plan->name,
                    'sessions_used' => $patientPlan->sessions_used,
                    'sessions_remaining' => $patientPlan->sessions_remaining,
                ]);

                // Marcar plan como exhausted si se agotaron las sesiones
                if ($patientPlan->is_exhausted) {
                    $patientPlan->update(['status' => 'exhausted']);
                    Log::info("Plan marcado como exhausted", ['patient_plan_id' => $patientPlan->id]);
                }
            }

            DB::commit();

            Log::info("Sesión creada exitosamente", [
                'session_id' => $session->id,
                'treatment_id' => $treatment->id,
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'consumes_plan' => $consumePlan,
                'patient_plan_id' => $patientPlan?->id,
            ]);

            session()->flash('message', 'Sesión creada correctamente');
            session()->flash('type', 'success');

            return back();
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error("Error al crear sesión 1: ", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            session()->flash('message', 'Error de validación');
            session()->flash('type', 'error');
            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error al crear sesión 2: ", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            session()->flash('message', 'Error al crear la sesión: ');
            session()->flash('type', 'error');
            return back();
        }
    }

    /**
     * Actualizar sesión existente
     */
    public function update(Request $request, $id)
    {

        $session = TreatmentSession::findOrFail($id);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consume_plan' => 'nullable|boolean',
            'patient_plan_id' => 'nullable|exists:patient_plans,id',
            'doctor_id' => 'required|exists:doctors,id',
            'session_type_id' => 'required|exists:session_types,id',
            'patient_amount_clp' => 'required|numeric|min:0',
            'date' => 'required|date',
            'time' => 'required',
            'duration' => 'required|integer|min:15',
            'status' => 'required|in:scheduled,completed,in_progress',

            'consume_plan' => 'nullable|boolean',
            'patient_plan_id' => 'nullable|exists:patient_plans,id',
            // Datos clínicos
            'pain_before' => 'nullable|integer|min:0|max:10',
            'pain_after' => 'nullable|integer|min:0|max:10',
            'rom_flexion_before' => 'nullable|integer|min:0|max:180',
            'rom_flexion_after' => 'nullable|integer|min:0|max:180',
            'rom_abduction_before' => 'nullable|integer|min:0|max:180',
            'rom_abduction_after' => 'nullable|integer|min:0|max:180',
            'rom_rotation_before' => 'nullable|integer|min:0|max:180',
            'rom_rotation_after' => 'nullable|integer|min:0|max:180',
            'notes' => 'nullable|string',
            'techniques' => 'nullable|array',
            'exercises' => 'nullable|array',
            'patient_amount_clp' => 'nullable|numeric|min:0',
        ]);


        DB::beginTransaction();
        try {
            // 🔍 Si cambió el doctor o tipo de sesión, validar comisión
            if (
                $session->doctor_id !== $validated['doctor_id'] ||
                $session->session_type_id !== $validated['session_type_id']
            ) {

                $doctor = Doctor::findOrFail($validated['doctor_id']);
                $sessionType = SessionType::findOrFail($validated['session_type_id']);

                $commissionRate = DoctorCommissionRate::active()
                    ->forDoctor($validated['doctor_id'])
                    ->forSessionType($validated['session_type_id'])
                    ->validAt(Carbon::parse($validated['date']))
                    ->first();

                if (!$commissionRate) {
                    DB::rollBack();
                    session()->flash('message', "⚠️ No hay comisión configurada para {$doctor->full_name} en sesiones de tipo '{$sessionType->name}'.");
                    session()->flash('type', 'error');
                    return back();
                }

                // Recalcular comisión con el nuevo rate
                $validated['commission_amount_clp'] = $commissionRate->calculateCommission($validated['patient_amount_clp']);
                $validated['commission_percentage'] = $commissionRate->commission_percentage;
                $validated['commission_type'] = $commissionRate->commission_type;
            }

            // ============================================
            // Determinar qué se puede editar según estado
            // ============================================
            $allowedFields = [];
            $oldPlanId = $session->patient_plan_id;
            $oldConsumePlan = $session->consumes_plan;

            switch ($session->status) {
                case 'scheduled':
                    // Puede editar todo excepto datos clínicos
                    $allowedFields = [
                        'patient_id',
                        'doctor_id',
                        'session_type_id',
                        'date',
                        'time',
                        'duration',
                        'status',
                        'consume_plan',
                        'patient_plan_id',
                        'patient_amount_clp'
                    ];
                    break;

                case 'completed':
                    // Solo datos clínicos
                    $allowedFields = [
                        'duration',
                        'session_type_id',
                        'date',
                        'time',
                        'pain_before',
                        'pain_after',
                        'rom_flexion_before',
                        'rom_flexion_after',
                        'rom_abduction_before',
                        'rom_abduction_after',
                        'rom_rotation_before',
                        'rom_rotation_after',
                        'notes',
                        'techniques',
                        'exercises',
                        'patient_amount_clp'
                    ];
                    break;

                case 'in_progress':
                    // Solo duración, tipo y datos clínicos
                    $allowedFields = [
                        'duration',
                        'session_type_id',
                        'date',
                        'time',
                        'pain_before',
                        'pain_after',
                        'rom_flexion_before',
                        'rom_flexion_after',
                        'rom_abduction_before',
                        'rom_abduction_after',
                        'rom_rotation_before',
                        'rom_rotation_after',
                        'notes',
                        'techniques',
                        'exercises',
                        'patient_amount_clp'
                    ];
                    break;

                case 'cancelled':
                case 'absent':
                    // No se puede editar
                    DB::rollBack();
                    session()->flash('message', 'Esta sesión no puede ser editada');
                    session()->flash('type', 'error');
                    return back();

                default:
                    DB::rollBack();
                    session()->flash('message', 'Estado de sesión no válido');
                    session()->flash('type', 'error');
                    return back();
            }

            // Filtrar solo campos permitidos
            $dataToUpdate = array_intersect_key($validated, array_flip($allowedFields));

            // ============================================
            // Manejo especial de cambios en el plan
            // ============================================
            if ($session->status === 'scheduled') {
                $newConsumePlan = $validated['consume_plan'] ?? $oldConsumePlan;
                $newPlanId = $validated['patient_plan_id'] ?? $oldPlanId;

                // CASO 1: Cambió de NO consumir a SÍ consumir
                if (!$oldConsumePlan && $newConsumePlan && $newPlanId) {
                    $patientPlan = PatientPlan::where('id', $newPlanId)
                        ->active()
                        ->notExpired()
                        ->withSessionsRemaining()
                        ->first();

                    if (!$patientPlan || $patientPlan->sessions_remaining <= 0) {
                        DB::rollBack();
                        session()->flash('message', 'El plan seleccionado no tiene sesiones disponibles');
                        session()->flash('type', 'error');
                        return back()->with('error', 'El plan seleccionado no tiene sesiones disponibles');
                    }

                    // Descontar del nuevo plan
                    $patientPlan->increment('sessions_used');
                    $patientPlan->refresh();

                    if ($patientPlan->is_exhausted) {
                        $patientPlan->update(['status' => 'exhausted']);
                    }

                    Log::info("Plan agregado a sesión existente", [
                        'session_id' => $session->id,
                        'patient_plan_id' => $patientPlan->id,
                    ]);
                }

                // CASO 2: Cambió de SÍ consumir a NO consumir
                if ($oldConsumePlan && !$newConsumePlan && $oldPlanId) {
                    $oldPlan = PatientPlan::find($oldPlanId);
                    if ($oldPlan) {
                        $oldPlan->decrement('sessions_used');
                        $oldPlan->refresh();

                        // Si estaba exhausted, reactivar
                        if ($oldPlan->status === 'exhausted' && $oldPlan->sessions_remaining > 0) {
                            $oldPlan->update(['status' => 'active']);
                        }

                        Log::info("Sesión liberada del plan", [
                            'session_id' => $session->id,
                            'patient_plan_id' => $oldPlanId,
                        ]);
                    }
                }

                // CASO 3: Cambió de un plan a otro plan
                if ($oldConsumePlan && $newConsumePlan && $oldPlanId && $newPlanId && $oldPlanId != $newPlanId) {
                    // Devolver al plan anterior
                    $oldPlan = PatientPlan::find($oldPlanId);
                    if ($oldPlan) {
                        $oldPlan->decrement('sessions_used');
                        $oldPlan->refresh();
                        if ($oldPlan->status === 'exhausted' && $oldPlan->sessions_remaining > 0) {
                            $oldPlan->update(['status' => 'active']);
                        }
                    }

                    // Descontar del nuevo plan
                    $newPlan = PatientPlan::where('id', $newPlanId)
                        ->active()
                        ->notExpired()
                        ->withSessionsRemaining()
                        ->first();

                    if (!$newPlan || $newPlan->sessions_remaining <= 0) {
                        DB::rollBack();
                        session()->flash('message', 'El nuevo plan no tiene sesiones disponibles');
                        session()->flash('type', 'error');
                        return back()->with('error', 'El nuevo plan no tiene sesiones disponibles');
                    }

                    $newPlan->increment('sessions_used');
                    $newPlan->refresh();

                    if ($newPlan->is_exhausted) {
                        $newPlan->update(['status' => 'exhausted']);
                    }

                    Log::info("Plan cambiado en sesión", [
                        'session_id' => $session->id,
                        'old_plan_id' => $oldPlanId,
                        'new_plan_id' => $newPlanId,
                    ]);
                }
            }

            // ============================================
            // Si cambió paciente o doctor, actualizar tratamiento
            // ============================================
            if (isset($dataToUpdate['patient_id']) || isset($dataToUpdate['doctor_id'])) {
                $patientId = $dataToUpdate['patient_id'] ?? $session->treatment->patient_id;
                $doctorId = $dataToUpdate['doctor_id'] ?? $session->treatment->doctor_id;

                $this->assignPatientToDoctor($patientId, $doctorId);

                $treatment = Treatment::firstOrCreate(
                    [
                        'patient_id' => $patientId,
                        'status' => 'in_progress',
                    ],
                    [
                        'doctor_id' => $doctorId,
                        'session_type_id' => $dataToUpdate['session_type_id'] ?? $session->session_type_id,
                        'diagnosis' => 'Tratamiento kinesiológico',
                        'start_date' => now(),
                    ]
                );

                $dataToUpdate['treatment_id'] = $treatment->id;
            }

            // ============================================
            // Actualizar la sesión
            // ============================================
            $session->update($dataToUpdate);


            DB::commit();

            session()->flash('message', 'Sesión actualizada correctamente');
            session()->flash('type', 'success');

            Log::info("Sesión actualizada exitosamente", [
                'session_id' => $session->id,
                'status' => $session->status,
                'fields_updated' => array_keys($dataToUpdate),
            ]);

            return back()->with('success', 'Sesión actualizada correctamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            session()->flash('message', 'Sesión no encontrada');
            session()->flash('type', 'error');
            return back()->with('error', 'Sesión no encontrada');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            session()->flash('message', 'Error de validación');
            session()->flash('type', 'error');
            return back()->withErrors($e->errors())->with('error', 'Error de validación');
        } catch (\Exception $e) {
            DB::rollBack();
            session()->flash('message', 'Error al actualizar sesión');
            session()->flash('type', 'error');
            Log::error("Error al actualizar sesión {$id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->with('error', 'Error al actualizar la sesión: ' . $e->getMessage());
        }
    }

    /**
     * Inicia una sesión (cambia estado a "in_progress")
     */
    public function startSession(Request $request, $id)
    {
        try {
            $session = TreatmentSession::findOrFail($id);

            if ($session->status !== 'scheduled') {
                session()->flash('message', 'Solo se pueden iniciar sesiones programadas.');
                session()->flash('type', 'error');
                return back();
            }

            $session->update([
                'status' => 'in_progress',
            ]);

            Log::info("Sesión iniciada: ID {$id}");

            session()->flash('message', 'Sesión iniciada correctamente.');
            session()->flash('type', 'success');
            return back();
        } catch (\Exception $e) {
            Log::error("Error al iniciar sesión {$id}: " . $e->getMessage());
            session()->flash('message', 'Error al iniciar la sesión.');
            session()->flash('type', 'error');
            return back();
        }
    }

    /**
     * Completa una sesión
     */
    public function completeSession(Request $request, $id)
    {
        try {
            $session = TreatmentSession::findOrFail($id);

            if (!in_array($session->status, ['scheduled', 'in_progress'])) {
                session()->flash('message', 'Esta sesión no puede ser completada');
                session()->flash('type', 'error');
                return back();
            }

            $validated = $request->validate([
                'pain_before' => 'required|integer|min:0|max:10',
                'pain_after' => 'required|integer|min:0|max:10',
                'rom_flexion' => 'nullable|numeric|min:0|max:180',
                'rom_abduction' => 'nullable|numeric|min:0|max:180',
                'rom_rotation' => 'nullable|numeric|min:0|max:180',
                'techniques' => 'nullable|array',
                'exercises' => 'nullable|array',
                'notes' => 'nullable|string',
                'homework' => 'nullable|string',
                'next_goals' => 'nullable|string',
            ]);

            // Convertir arrays a JSON
            if (isset($validated['techniques'])) {
                $validated['techniques'] = json_encode($validated['techniques']);
            }
            if (isset($validated['exercises'])) {
                $validated['exercises'] = json_encode($validated['exercises']);
            }

            $validated['status'] = 'completed';
            $validated['completed_at'] = now();

            $session->update($validated);

            Log::info("Sesión completada: ID {$id}");

            session()->flash('message', 'Sesión completada correctamente');
            session()->flash('type', 'success');

            return back();
        } catch (\Exception $e) {
            Log::error("Error al completar sesión {$id}: " . $e->getMessage());
            session()->flash('message', 'Esta sesión no puede ser completada');
            session()->flash('type', 'error');
            return back();
        }
    }

    /**
     * Cancela una sesión
     */
    public function cancelSession(Request $request, $id)
    {
        try {
            $session = TreatmentSession::findOrFail($id);

            if ($session->status === 'cancelled') {
                return back()->with('error', 'Esta sesión ya está cancelada');
            }

            $validated = $request->validate([
                'cancellation_reason' => 'required|string|min:10',
            ]);

            $session->update([
                'status' => 'cancelled',
                'notes' => ($session->notes ?? '') . "\n\nMotivo de cancelación: " . $validated['cancellation_reason'],
            ]);

            Log::info("Sesión cancelada: ID {$id}");

            return back()->with('success', 'Sesión cancelada correctamente');
        } catch (\Exception $e) {
            Log::error("Error al cancelar sesión {$id}: " . $e->getMessage());
            return back()->with('error', 'Error al cancelar la sesión');
        }
    }

    /**
     * Marca una sesión como ausente
     */
    public function markAbsent(Request $request, $id)
    {
        try {
            $session = TreatmentSession::findOrFail($id);

            $session->update([
                'status' => 'absent',
                'notes' => ($session->notes ?? '') . "\n\nPaciente no asistió a la sesión",
            ]);

            Log::info("Sesión marcada como ausente: ID {$id}");

            return back()->with('success', 'Sesión marcada como ausente');
        } catch (\Exception $e) {
            Log::error("Error al marcar ausente sesión {$id}: " . $e->getMessage());
            return back()->with('error', 'Error al marcar la sesión como ausente');
        }
    }

    /**
     * Mapea el tipo de sesión del backend al formato del frontend
     */
    /* private function mapSessionType($type)
    {
        $map = [
            'Evaluación Inicial' => 'evaluacion',
            'Sesión' => 'sesion',
            'Control' => 'control',
            'Reevaluación' => 'control',
        ];

        return $map[$type] ?? 'sesion';
    } */


    /**
     * Asigna un paciente a un doctor si no está asignado
     */
    private function assignPatientToDoctor($patientId, $doctorId)
    {
        $exists = DB::table('doctor_patient_assignments')
            ->where('patient_id', $patientId)
            ->where('doctor_id', $doctorId)
            ->exists();

        if (!$exists) {
            DB::table('doctor_patient_assignments')->insert([
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Paciente asignado a doctor", [
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
            ]);
        }
    }
    /**
     * Obtener estado de la última ejecución automática
     */

    public function getAutoUpdateStats()
    {
        $stats = [
            'scheduled_at_risk' => TreatmentSession::where('status', 'scheduled')
                ->whereDate('date', '<', now())
                ->count(),

            'in_progress_at_risk' => TreatmentSession::where('status', 'in_progress')
                ->whereDate('date', '<', now())
                ->count(),

            'last_auto_update' => Cache::get('last_auto_update_run', 'Nunca'),

            'next_run' => now()->addMinutes(15)->format('H:i'),
        ];

        return response()->json($stats);
    }
}
