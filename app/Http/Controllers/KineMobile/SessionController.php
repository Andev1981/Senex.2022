<?php
// app/Http/Controllers/KineMobile/SessionController.php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\TreatmentSession;
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
                'duration' => $session->sessionType->duration_minutes,
                'diagnosis' => $session->treatment->diagnosis ?? 'Sin diagnóstico',
                'earnings' => $session->doctor_amount,
                'notes' => $session->notes,
            ];
        });

        // Estadísticas del período
        $stats = [
            'total' => $sessions->count(),
            'completed' => $sessions->where('status', 'Completada')->count(),
            'pending' => $sessions->where('status', 'Programada')->count(),
            'cancelled' => $sessions->where('status', 'Cancelada')->count(),
            'revenue' => $sessions->where('status', 'Completada')->sum('earnings'),
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
                'date' => $session->date,
                'time' => $session->time,
                'status' => $session->status,
                'notes' => $session->notes,
                'duration_actual' => $session->duration_actual,
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
                    'patient_amount' => $session->patient_amount,
                    'doctor_amount' => $session->doctor_amount,
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
        if ($session->status !== 'Programada') {
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
                'duration_actual' => $validated['duration_actual'] ?? $session->sessionType->duration_minutes,
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

            // Disparar evento (para notificaciones, etc)
/*             event(new SessionCompletedEvent($session));
 */
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
                'message' => 'Error al completar la sesión: ' . $e->getMessage()
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
        if ($session->status !== 'Programada') {
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
}