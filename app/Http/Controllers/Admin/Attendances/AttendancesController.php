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
            
            $treatmentSessions = TreatmentSession::get();

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
                    'status',
                    'month_session_number',
                    'duration',
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

            $activeItem = $session->invoiceItems->first(function ($item) {
                return $item->invoice && 
                    $item->invoice->payment_status !== 'voided' && // Que no esté anulada internamente
                    $item->invoice->dte_status !== 'rejected';     // Que no esté rechazada por el SII
            });

    $activeInvoice = $activeItem ? $activeItem->invoice : null;
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
                    // Estado real de facturación (Combinamos Invoice + DTE)
                    'billing_info' => $activeInvoice ? [
                        'invoice_id'      => $activeInvoice->id,
                        'status_internal' => $activeInvoice->payment_status, // paid, unpaid
                        'dte_status'      => $activeInvoice->dte_status,     // pending, accepted, rejected
                        'folio'           => $activeInvoice->dte_folio,      // El folio real si ya existe
                        'type'            => $activeInvoice->dte_type,       // 39, 33, etc.
                        'pdf_path'        => $activeInvoice->pdf_path,       // Para descargar
                    ] : null,
                    'is_locked'       => $activeInvoice ? true : false,      // ¿Bloquear checkbox?
                    'dte_generated'   => $activeInvoice && $activeInvoice->dte_status === 'accepted',
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
                ->with([
                    'activePlans' => function ($query) {
                        $query->active()
                            ->notExpired()
                            ->withSessionsRemaining()
                            ->select('id', 'patient_id', 'plan_id', 'sessions_included', 'sessions_used', 'expiry_date')
                            ->with('plan:id,name,code,description');
                    },
                    'treatments' => function ($query) {
                        $query->whereIn('status', ['in_progress', 'evaluation'])
                              ->select('id', 'patient_id', 'status', 'diagnostic_code', 'referral_diagnosis', 'referral_doctor_name', 'total_sessions', 'completed_sessions', 'is_indefinite')
                              ->with('diagnostic:code,description'); // Cargar diagnóstico si existe relación
                    }
                ])
                ->get()
                // Mapeo seguro (Null Safe)
                ->map(fn($p) => [
                    'id' => $p->id,
                    'full_name' => $p->full_name, // Asumiendo que tienes un Accessor getFullNameAttribute
                    'name' => $p->name,
                    'last_name' => $p->last_name,
                    'rut' => $p->rut,
                    'active_treatments' => $p->treatments->map(fn($t) => [
                        'id' => $t->id,
                        'status' => $t->status,
                        'diagnostic' => $t->diagnostic ? [
                            'code' => $t->diagnostic->code,
                            'description' => $t->diagnostic->description
                        ] : null,
                        'referral_diagnosis' => $t->referral_diagnosis,
                        'referral_doctor_name' => $t->referral_doctor_name,
                        'total_sessions' => $t->total_sessions,
                        'completed_sessions' => $t->completed_sessions,
                        'is_indefinite' => $t->is_indefinite,
                    ]),
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

            return Inertia::render('attendances/index', [
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

            return Inertia::render('attendances/index', [
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
