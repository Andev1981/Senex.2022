<?php
// app/Http/Controllers/KineMobile/SessionController.php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\TreatmentSession;
use App\Models\Treatment;
use App\Models\SessionType;
use App\Events\SessionCompletedEvent;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    /**
     * Lista de sesiones del kine
     */
    public function index(Request $request): Response
    {
        $doctor = Auth::user()->doctor;
        
        // Filtros
        $startDate = $request->input('start_date', Carbon::today()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::today()->endOfMonth()->format('Y-m-d'));
        $status = $request->input('status');

        $query = TreatmentSession::with([
            'patient:id,name,last_name,phone',
            'treatment:id,diagnosis',
            'sessionType:id,name,duration_minutes'
        ])
            ->where('doctor_id', $doctor->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        $sessions = $query->get()->map(function ($session) {
            return [
                'id' => $session->id,
                'date' => $session->date,
                'time' => $session->time,
                'status' => $session->status,
                'patient_name' => $session->patient->name . ' ' . $session->patient->last_name,
                'patient_phone' => $session->patient->phone,
                'session_type' => $session->sessionType->name,
                'duration' => $session->duration ?? $session->sessionType->duration_minutes,
                'diagnosis' => $session->treatment->diagnosis ?? 'Sin diagnóstico',
                'earnings' => $session->doctor_amount_cl,
                'notes' => $session->notes,
            ];
        });

        // Estadísticas del período
        $stats = [
            'total' => $sessions->count(),
            'completed' => $sessions->where('status', 'completed')->count(),
            'pending' => $sessions->where('status', 'scheduled')->count(),
            'cancelled' => $sessions->where('status', 'cacelled')->count(),
            'revenue' => $sessions->where('status', 'completed')->sum('earnings'),
        ];

        return Inertia::render('KineMobile/MySessions', [
            'sessions' => $sessions,
            'stats' => $stats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Detalle de una sesión específica
     */
    public function show(TreatmentSession $session): Response
    {
        $doctor = Auth::user()->doctor;

        // Verificar que la sesión pertenezca al kine
        if ($session->doctor_id !== $doctor->id) {
            abort(403, 'No tienes acceso a esta sesión');
        }

        $session->load([
            'patient:id,name,last_name,phone,rut',
            'treatment:id,diagnosis,objectives',
            'sessionType:id,name,duration_minutes,base_price'
        ]);

        return Inertia::render('KineMobile/SessionDetail', [
            'session' => [
                'id' => $session->id,
                'session_number' => $session->session_number,
                'month_session_number' => $session->month_session_number,
                'date' => $session->date,
                'time' => $session->time,
                'duration' => $session->duration,
                'status' => $session->status,
                'notes' => $session->notes,
                'homework' => $session->homework,
                'next_goals' => $session->next_goals,
                'duration_actual' => $session->duration_actual,
                
                // Métricas clínicas
                'pain_before' => $session->pain_before,
                'pain_after' => $session->pain_after,
                'rom_flexion_before' => $session->rom_flexion_before,
                'rom_flexion_after' => $session->rom_flexion_after,
                'rom_abduction_before' => $session->rom_abduction_before,
                'rom_abduction_after' => $session->rom_abduction_after,
                'rom_rotation_before' => $session->rom_rotation_before,
                'rom_rotation_after' => $session->rom_rotation_after,
                'techniques' => $session->techniques ?? [],
                'exercises' => $session->exercises ?? [],
                
                'patient' => [
                    'id' => $session->patient->id,
                    'name' => $session->patient->name . ' ' . $session->patient->last_name,
                    'phone' => $session->patient->phone,
                    'rut' => $session->patient->rut,
                ],
                'treatment' => [
                    'diagnosis' => $session->treatment->diagnosis,
                    'objectives' => $session->treatment->objectives,
                ],
                'session_type' => [
                    'name' => $session->sessionType->name,
                    'duration' => $session->sessionType->duration_minutes,
                    'base_price' => $session->sessionType->base_price,
                ],
                'payment' => [
                    'patient_amount_clp' => $session->patient_amount_clp,
                    'doctor_amount_clp' => $session->doctor_amount_clp,
                    'commission_rate' => $session->commission_rate,
                ],
                'timestamps' => [
                    'created_at' => $session->created_at,
                    'completed_at' => $session->completed_at,
                ],
            ],
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create(): Response
    {
        $doctor = Auth::user()->doctor;
        $doctor->load('commissionRates.sessionType');
        
        // Obtener pacientes asignados al kine
        /* $patients = $doctor->patients()
            ->select('id', 'name', 'last_name', 'rut')
            ->orderBy('name','desc')
            ->get()
            ->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'name' => $patient->name . ' ' . $patient->last_name,
                    'rut' => $patient->rut,
                ];
            }); */

        $patients = $doctor->patients()->get();

        // Obtener tratamientos activos de esos pacientes
        $treatments = Treatment::with('sessionType:id,name')
            ->whereIn('patient_id', $patients->pluck('id'))
            ->where('doctor_id', $doctor->id)
            ->where('status', 'InProgress')
            ->get()
            ->map(function ($treatment) {
                return [
                    'id' => $treatment->id,
                    'patient_id' => $treatment->patient_id,
                    'diagnosis' => $treatment->diagnosis,
                    'session_type_id' => $treatment->session_type_id,
                    'session_type_name' => $treatment->sessionType->name,
                ];
            });

        // Obtener tipos de sesión
        $sessionTypes = SessionType::where('active', true)
            ->select('id', 'name', 'base_price', 'duration_minutes')
            ->orderBy('name')
            ->get();

        return Inertia::render('KineMobile/SessionForm', [
            'session' => null,
            'patients' => $patients,
            'treatments' => $treatments,
            'sessionTypes' => $sessionTypes,
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name . ' ' . $doctor->last_name,
                'commission_rates' => $doctor->commissionRates->map(function ($rate) {
                    return [
                        'session_type_id' => $rate->session_type_id,
                        'commission_type' => $rate->commission_type,
                        'commission_value' => $rate->commission_value,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Guardar nueva sesión
     */
    public function store(Request $request)
    {
        $doctor = Auth::user()->doctor;

        $validated = $request->validate([
            // Básicos
            'patient_id' => 'required|exists:patients,id',
            'treatment_id' => 'required|exists:treatments,id',
            'session_type_id' => 'required|exists:session_types,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'duration' => 'nullable|integer|min:15|max:180',
            
            // Métricas clínicas
            'pain_before' => 'nullable|integer|min:0|max:10',
            'pain_after' => 'nullable|integer|min:0|max:10',
            'rom_flexion_before' => 'nullable|integer|min:0|max:180',
            'rom_flexion_after' => 'nullable|integer|min:0|max:180',
            'rom_abduction_before' => 'nullable|integer|min:0|max:180',
            'rom_abduction_after' => 'nullable|integer|min:0|max:180',
            'rom_rotation_before' => 'nullable|integer|min:0|max:180',
            'rom_rotation_after' => 'nullable|integer|min:0|max:180',
            'techniques' => 'nullable|array',
            'exercises' => 'nullable|array',
            
            // Notas
            'notes' => 'nullable|string|max:2000',
            'homework' => 'nullable|string|max:2000',
            'next_goals' => 'nullable|string|max:2000',
            
            // Pagos
            'patient_amount' => 'required|numeric|min:0',
            'doctor_amount' => 'required|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0',
        ]);

        // Verificar que el tratamiento pertenezca al kine y al paciente
        $treatment = Treatment::where('id', $validated['treatment_id'])
            ->where('doctor_id', $doctor->id)
            ->where('patient_id', $validated['patient_id'])
            ->firstOrFail();

        DB::beginTransaction();
        try {
            // Calcular números de sesión
            $sessionNumber = TreatmentSession::where('treatment_id', $treatment->id)->count() + 1;
            
            $monthSessionNumber = TreatmentSession::where('treatment_id', $treatment->id)
                ->whereYear('date', Carbon::parse($validated['date'])->year)
                ->whereMonth('date', Carbon::parse($validated['date'])->month)
                ->count() + 1;

            $sessionType = SessionType::findOrFail($validated['session_type_id']);

            $session = TreatmentSession::create([
                // Básicos
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $doctor->id,
                'treatment_id' => $validated['treatment_id'],
                'session_type_id' => $validated['session_type_id'],
                'session_number' => $sessionNumber,
                'month_session_number' => $monthSessionNumber,
                'date' => $validated['date'],
                'time' => $validated['time'],
                'duration' => $validated['duration'] ?? $sessionType->duration_minutes,
                'status' => 'scheduled',
                
                // Métricas clínicas
                'pain_before' => $validated['pain_before'] ?? 0,
                'pain_after' => $validated['pain_after'] ?? 0,
                'rom_flexion_before' => $validated['rom_flexion_before'] ?? 0,
                'rom_flexion_after' => $validated['rom_flexion_after'] ?? 0,
                'rom_abduction_before' => $validated['rom_abduction_before'] ?? 0,
                'rom_abduction_after' => $validated['rom_abduction_after'] ?? 0,
                'rom_rotation_before' => $validated['rom_rotation_before'] ?? 0,
                'rom_rotation_after' => $validated['rom_rotation_after'] ?? 0,
                'techniques' => $validated['techniques'] ?? [],
                'exercises' => $validated['exercises'] ?? [],
                
                // Notas
                'notes' => $validated['notes'],
                'homework' => $validated['homework'],
                'next_goals' => $validated['next_goals'],
                
                // Pagos
                'patient_amount_clp' => $validated['patient_amount_clp'],
                'doctor_amount' => $validated['doctor_amount_clp'],
                'doctor_amount_clp' => $validated['commission_rate'] ?? 0,
            ]);

            DB::commit();

            Log::info('Sesión creada por kine', [
                'session_id' => $session->id,
                'doctor_id' => $doctor->id,
                'patient_id' => $validated['patient_id'],
            ]);

            return redirect()->route('kine.dashboard')
                ->with('success', 'Sesión creada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al crear sesión', [
                'doctor_id' => $doctor->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear la sesión: ' . $e->getMessage()]);
        }
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(TreatmentSession $session): Response
    {
        $doctor = Auth::user()->doctor;

        // Verificar que la sesión pertenezca al kine
        if ($session->doctor_id !== $doctor->id) {
            abort(403, 'No tienes acceso a esta sesión');
        }

        $session->load([
            'patient:id,name,last_name,rut',
            'treatment:id,diagnosis',
        ]);

        $sessionTypes = SessionType::where('active', true)
            ->select('id', 'name', 'base_price', 'duration_minutes')
            ->orderBy('name')
            ->get();

        // Cargar comisiones del doctor
        $doctor->load('commissionRates.sessionType');

        $session = [
                'id' => $session->id,
                'patient_id' => $session->patient_id,
                'treatment_id' => $session->treatment_id,
                'session_type_id' => $session->session_type_id,
                'session_number' => $session->session_number,
                'month_session_number' => $session->month_session_number,
                'date' => $session->date,
                'time' => $session->time,
                'duration' => $session->duration,
                'status' => $session->status,
                
                // Métricas clínicas
                'pain_before' => $session->pain_before ?? 0,
                'pain_after' => $session->pain_after ?? 0,
                'rom_flexion_before' => $session->rom_flexion_before ?? 0,
                'rom_flexion_after' => $session->rom_flexion_after ?? 0,
                'rom_abduction_before' => $session->rom_abduction_before ?? 0,
                'rom_abduction_after' => $session->rom_abduction_after ?? 0,
                'rom_rotation_before' => $session->rom_rotation_before ?? 0,
                'rom_rotation_after' => $session->rom_rotation_after ?? 0,
                'techniques' => $session->techniques ?? [],
                'exercises' => $session->exercises ?? [],
                
                // Notas
                'notes' => $session->notes,
                'homework' => $session->homework,
                'next_goals' => $session->next_goals,
                
                'patient' => [
                    'id' => $session->patient->id,
                    'name' => $session->patient->name . ' ' . $session->patient->last_name,
                    'rut' => $session->patient->rut,
                ],
                'treatment' => [
                    'diagnosis' => $session->treatment->diagnosis,
                ],
                'payment' => [
                    'patient_amount' => $session->patient_amount_clp,
                    'doctor_amount' => $session->doctor_amount_clp,
                    'commission_rate' => $session->commission_rate,
                ],
            ];

            dd($session);

        return Inertia::render('KineMobile/SessionForm', [
            'session' => $session,
            'patients' => [],
            'treatments' => [],
            'sessionTypes' => $sessionTypes,
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name . ' ' . $doctor->last_name,
                'commission_rates' => $doctor->commissionRates->map(function ($rate) {
                    return [
                        'session_type_id' => $rate->session_type_id,
                        'commission_type' => $rate->commission_type,
                        'commission_value' => $rate->commission_value,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Actualizar sesión
     */
    // app/Http/Controllers/KineMobile/SessionController.php

    public function update(Request $request, TreatmentSession $session)
    {
        $doctor = Auth::user()->doctor;

        // Verificar permisos
        if ($session->doctor_id !== $doctor->id) {
            return back()->withErrors(['error' => 'No tienes permisos']);
        }

        // Obtener reglas de edición según estado
        $editRules = config('session_editing')[$session->status] ?? null;

        if (!$editRules || !$editRules['editable']) {
            return back()->withErrors(['error' => 'Esta sesión no puede ser editada']);
        }

        // Verificar límite de tiempo para sesiones completadas
        if ($editRules['time_limit_hours'] && $session->completed_at) {
            $hoursLimit = $editRules['time_limit_hours'];
            $completedAt = Carbon::parse($session->completed_at);
            
            if ($completedAt->diffInHours(now()) > $hoursLimit) {
                return back()->withErrors([
                    'error' => "Solo puedes editar sesiones completadas dentro de las primeras {$hoursLimit} horas"
                ]);
            }
        }

        // Determinar campos editables
        $allowedFields = $editRules['fields'] === 'all' 
            ? [
                'session_type_id', 'date', 'time', 'duration',
                'pain_before', 'pain_after',
                'rom_flexion_before', 'rom_flexion_after',
                'rom_abduction_before', 'rom_abduction_after',
                'rom_rotation_before', 'rom_rotation_after',
                'techniques', 'exercises',
                'notes', 'homework', 'next_goals',
            ]
            : $editRules['fields'];

        // Reglas de validación base
        $allValidationRules = [
            'session_type_id' => 'required|exists:session_types,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'duration' => 'nullable|integer|min:15|max:180',
            'pain_before' => 'nullable|integer|min:0|max:10',
            'pain_after' => 'nullable|integer|min:0|max:10',
            'rom_flexion_before' => 'nullable|integer|min:0|max:180',
            'rom_flexion_after' => 'nullable|integer|min:0|max:180',
            'rom_abduction_before' => 'nullable|integer|min:0|max:180',
            'rom_abduction_after' => 'nullable|integer|min:0|max:180',
            'rom_rotation_before' => 'nullable|integer|min:0|max:180',
            'rom_rotation_after' => 'nullable|integer|min:0|max:180',
            'techniques' => 'nullable|array',
            'exercises' => 'nullable|array',
            'notes' => 'nullable|string|max:2000',
            'homework' => 'nullable|string|max:2000',
            'next_goals' => 'nullable|string|max:2000',
        ];

        // Agregar validación de razón si es requerida
        if ($editRules['requires_reason']) {
            $allValidationRules['reason'] = 'required|string|max:500';
        }

        // Filtrar solo las reglas de campos permitidos
        $validationRules = array_intersect_key(
            $allValidationRules, 
            array_flip(array_merge($allowedFields, $editRules['requires_reason'] ? ['reason'] : []))
        );

        $validated = $request->validate($validationRules);

        // Remover reason de los datos a actualizar
        $reason = $validated['reason'] ?? null;
        unset($validated['reason']);

        try {
            // Solo actualizar campos permitidos
            $dataToUpdate = array_intersect_key($validated, array_flip($allowedFields));
            
            $session->update($dataToUpdate);

            Log::info('Sesión actualizada', [
                'session_id' => $session->id,
                'status' => $session->status,
                'doctor_id' => $doctor->id,
                'updated_fields' => array_keys($dataToUpdate),
                'reason' => $reason,
            ]);

            return redirect()->route('kine.sessions.show', $session->id)
                ->with('success', 'Sesión actualizada exitosamente');

        } catch (\Exception $e) {
            Log::error('Error al actualizar sesión', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al actualizar la sesión']);
        }
    }
    

    /**
     * Completar sesión rápidamente
     */
    public function complete(Request $request, TreatmentSession $session)
    {
        $doctor = Auth::user()->doctor;

        // Verificar permisos
        if ($session->doctor_id !== $doctor->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para completar esta sesión'
            ], 403);
        }

        // Validar estado
        if ($session->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes completar sesiones programadas'
            ], 400);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
            'duration_actual' => 'nullable|integer|min:1|max:180',
        ]);

        DB::beginTransaction();
        try {
            $session->update([
                'status' => 'Completada',
                'notes' => $validated['notes'] ?? $session->notes,
                'duration_actual' => $validated['duration_actual'] ?? $session->duration,
                'completed_at' => now(),
            ]);

            // Actualizar contadores del tratamiento
            $treatment = $session->treatment;
            $treatment->increment('completed_sessions');
            
            // Verificar si se completó el tratamiento
            if ($treatment->total_sessions && $treatment->completed_sessions >= $treatment->total_sessions) {
                $treatment->update(['status' => 'Completed']);
            }

            DB::commit();

            // Disparar evento
            /* event(new SessionCompletedEvent($session)); */

            Log::info('Sesión completada por kine', [
                'session_id' => $session->id,
                'doctor_id' => $doctor->id,
            ]);

            // Calcular earnings del día actualizados
            $todayEarnings = TreatmentSession::where('doctor_id', $doctor->id)
                ->whereDate('date', today())
                ->where('status', 'Completada')
                ->sum('doctor_amount');

            return response()->json([
                'success' => true,
                'message' => 'Sesión completada correctamente',
                'data' => [
                    'session_id' => $session->id,
                    'today_earnings' => $todayEarnings,
                    'treatment_progress' => [
                        'completed' => $treatment->completed_sessions,
                        'total' => $treatment->total_sessions,
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al completar sesión', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al completar la sesión'
            ], 500);
        }
    }

    /**
     * Cancelar sesión
     */
    public function cancel(Request $request, TreatmentSession $session)
    {
        $doctor = Auth::user()->doctor;

        // Verificar permisos
        if ($session->doctor_id !== $doctor->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para cancelar esta sesión'
            ], 403);
        }

        // Validar estado
        if ($session->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes cancelar sesiones programadas'
            ], 400);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        try {
            $session->update([
                'status' => 'Cancelada',
                'notes' => ($session->notes ? $session->notes . "\n\n" : '') . 
                          "CANCELADA: " . $validated['cancellation_reason'],
            ]);

            Log::info('Sesión cancelada por kine', [
                'session_id' => $session->id,
                'doctor_id' => $doctor->id,
                'reason' => $validated['cancellation_reason']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesión cancelada correctamente',
            ]);

        } catch (\Exception $e) {
            Log::error('Error al cancelar sesión', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar la sesión'
            ], 500);
        }
    }

    /**
     * Eliminar sesión
     */
    public function destroy(TreatmentSession $session)
    {
        $doctor = Auth::user()->doctor;

        // Verificar permisos
        if ($session->doctor_id !== $doctor->id) {
            return back()->withErrors(['error' => 'No tienes permisos']);
        }

        // Solo se pueden eliminar sesiones programadas
        if ($session->status !== 'scheduled') {
            return back()->withErrors(['error' => 'Solo puedes eliminar sesiones programadas']);
        }

        try {
            $session->delete();

            Log::info('Sesión eliminada por kine', [
                'session_id' => $session->id,
                'doctor_id' => $doctor->id,
            ]);

            return redirect()->route('kine.my-sessions')
                ->with('success', 'Sesión eliminada exitosamente');

        } catch (\Exception $e) {
            Log::error('Error al eliminar sesión', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al eliminar la sesión']);
        }
    }

    /**
     * Actualizar solo las notas de una sesión
     */
    public function updateNotes(Request $request, TreatmentSession $session)
    {
        $doctor = Auth::user()->doctor;

        // Verificar permisos
        if ($session->doctor_id !== $doctor->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para editar esta sesión'
            ], 403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:2000',
        ]);

        try {
            $session->update([
                'notes' => $validated['notes']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notas guardadas correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al guardar notas', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al guardar notas'
            ], 500);
        }
    }
}