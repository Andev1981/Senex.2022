<?php

namespace App\Http\Controllers;


use App\Http\Requests\StoreTreatmentSessionRequest;
use App\Http\Requests\UpdateTreatmentSessionRequest;
use App\Models\TreatmentSession;
use App\Models\Patient;
use App\Services\Plans\PlanService;
use App\Services\TreatmentSessionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TreatmentSessionController extends Controller
{

    /**
     * Inyectar el service en el constructor
     */
    public function __construct(
        private TreatmentSessionService $sessionService,    
        private PlanService $planService
    ) {}


    /**
     * STORE - POST /sessions
     * Retorna JsonResponse para manejo desde formularios modales
     */
    public function store(StoreTreatmentSessionRequest $request)
    {
     
        try {
            /* dd($request->all()); */
             // El service maneja toda la lógica:
            // - Asigna month_session_number automáticamente
            // - Valida disponibilidad del doctor
            // - Crea logs
           
            $this->sessionService->createSession($request->validated());

            // Si la sesión es completada, el service ya incrementó el contador
            // Ya no necesitas hacerlo manualmente aquí

            session()->flash('message', 'Sesión creada exitosamente.');
            session()->flash('type', 'success');

        } catch (\Exception $e) {
            // FALLO: Capturar la excepción del Service, loguear y redirigir con el mensaje de error
            Log::error("Error de lógica al agendar sesión: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            
            session()->flash('message', "ERROR: " . $e->getMessage());
            session()->flash('type', 'error');
    
        }
    }

    /**
     * UPDATE - PUT/PATCH /sessions/{session}
     * Retorna JsonResponse para manejo desde formularios modales
     */
    public function update(UpdateTreatmentSessionRequest $request, TreatmentSession $treatmentSession)
    {
        try {
            
            // El service recalcula month_session_number si cambió la fecha
            $this->sessionService->updateSession($treatmentSession, $request->validated());

            session()->flash('message', 'Sesión actualizada exitosamente.');
            session()->flash('type', 'success');
            return back();

        } catch (\Exception $e) {
            session()->flash('message', 'Error al actualizar la sesión: ' . $e->getMessage());
            session()->flash('type', 'error');
            return back();
          
        }
    }

    /**
     * DESTROY - DELETE /sessions/{session}
     * Retorna JsonResponse para manejo desde modales
     */
    public function destroy(TreatmentSession $session)
    {
        try {
            // No permitir eliminar sesiones completadas
            if ($session->isCompleted()) {
               
                session()->flash('message', 'No se puede eliminar una sesión completada');
                session()->flash('type', 'error');
                return;
            }

            // Si es una sesión programada, solo la eliminamos
            $session->delete();

            session()->flash('message', 'Sesión eliminada exitosamente.');
            session()->flash('type', 'success');

        } catch (\Exception $e) {
            session()->flash('message', 'Error al actualizar la sesión: ' . $e->getMessage());
            session()->flash('type', 'error');
        }
    }

    /**
     * COMPLETE - PUT /sessions/{session}/complete
     * Marcar sesión como completada específicamente
     */
    public function complete(UpdateTreatmentSessionRequest $request, TreatmentSession $session)
    {
        try {
              $session = TreatmentSession::findOrFail($session->id);
            
            // El service marca como completada Y incrementa el contador del tratamiento
            $session = $this->sessionService->completeSession($session, $request->validated());

            session()->flash('message', 'Sesión completada exitosamente.');
            session()->flash('type', 'success');


        } catch (\Exception $e) {
                session()->flash('message', 'Error al actualizar la sesión: ' . $e->getMessage());
            session()->flash('type', 'error');
        }
    }

    /**
     * CANCEL - PUT /sessions/{session}/cancel
     * Cancelar sesión específica
     */
    public function cancel(Request $request, TreatmentSession $session): JsonResponse
    {
        try {
            $session->update([
                'status' => 'Cancelada',
                'notes' => $request->input('notes', $session->notes),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesión cancelada exitosamente',
                'session' => $session->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar la sesión: ' . $e->getMessage(),
                'errors' => ['general' => ['Error interno del servidor']],
            ], 500);
        }
    }

    public function cancelSession(TreatmentSession $session, ?string $reason = null): TreatmentSession
    {
        return DB::transaction(function () use ($session, $reason) {
            if ($session->isCompleted()) {
                throw new \Exception('No se puede cancelar una sesión completada');
            }

            $oldStatus = $session->status;

            $data = ['status' => 'canceled'];

            if ($reason) {
                $data['notes'] = ($session->notes ? $session->notes . "\n\n" : '') 
                               . "Motivo de cancelación: {$reason}";
            }

            $session->update($data);

            // Si estaba completada, revertir consumo del plan
            if ($oldStatus === 'completed') {
                $this->planService->revertSessionConsumption($session);
            }

            // Actualizar tratamiento
            $this->updateTreatmentAfterStatusChange($session, $oldStatus, 'canceled');

            return $session->fresh();
        });
    }

    /**
     * API - GET /api/patients/{patient}/sessions/summary
     * Resumen de sesiones para dashboard
     */
    public function summary(Patient $patient)
    {
        $sessions = TreatmentSession::where('patient_id', $patient->id);

        $summary = [
            'total' => $sessions->count(),
            'scheduled' => $sessions->scheduled()->count(),
            'completed' => $sessions->completed()->count(),
            'cancelled' => $sessions->cancelled()->count(),
            'upcoming' => $sessions->scheduled()
                ->where('date', '>=', now()->toDateString())
                ->count(),
        ];

        // Próxima sesión
        $nextSession = TreatmentSession::where('patient_id', $patient->id)
            ->scheduled()
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('time')
            ->first();

        return response()->json([
            'summary' => $summary,
            'next_session' => $nextSession,
        ]);
    }

    /**
     * API - POST /api/sessions/{session}/duplicate
     * Duplicar sesión para crear siguiente
     */
    public function duplicate(TreatmentSession $session): JsonResponse
    {
        try {
            $newSession = $session->replicate();
            $newSession->status = 'Programada';
            $newSession->pain_before = null;
            $newSession->pain_after = null;
            $newSession->notes = null;
            $newSession->homework = null;
            $newSession->next_goals = null;
            $newSession->save();

            return response()->json([
                'success' => true,
                'message' => 'Sesión duplicada exitosamente',
                'session' => $newSession,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al duplicar la sesión: ' . $e->getMessage(),
                'errors' => ['general' => ['Error interno del servidor']],
            ], 500);
        }
    }
}
