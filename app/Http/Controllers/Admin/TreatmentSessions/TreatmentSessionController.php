<?php

namespace App\Http\Controllers\Admin\TreatmentSessions;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreatmentSessionRequest;
use App\Http\Requests\UpdateTreatmentSessionRequest;
use App\Models\TreatmentSession;
use App\Models\Patient;
use App\Models\Item;
use App\Models\Doctor;
use App\Models\Diagnostic;
use App\Services\Plans\PlanService;
use App\Services\Treatments\TreatmentSessionService;
use App\Enums\AppointmentStatusEnum;
use App\Enums\FinanceStatusEnum;
use App\Enums\DteStatusEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TreatmentSessionController extends Controller
{
    public function __construct(
        private TreatmentSessionService $sessionService,
        private PlanService $planService
    ) {}

    /**
     * Muestra la vista principal de atenciones y sesiones.
     * Consolidado de AttendancesController y TreatmentSessionController.
     */
    public function index(Request $request)
    {
        $companyId = session('current_company_id');

        try {
            $inicioMes = now()->startOfMonth()->format('Y-m-d');
            $finMes = now()->endOfMonth()->format('Y-m-d');

            $fechaInicio = $request->input('fecha_inicio', $inicioMes);
            $fechaFin = $request->input('fecha_fin', $finMes);
            $estado = $request->input('estado', 'all');
            $query = $request->input('query', '');

            if ($fechaInicio > $fechaFin) {
                $temp = $fechaInicio; $fechaInicio = $fechaFin; $fechaFin = $temp;
            }
            
            $sessionsQuery = TreatmentSession::with([
                'patient',
                'doctor',
                'item',
                'appointment',
                'invoiceItems.invoice',
            ])
                ->where('treatment_sessions.company_id', $companyId)
                ->whereBetween('treatment_sessions.date', [$fechaInicio, $fechaFin])
                ->orderBy('treatment_sessions.date', 'desc')
                ->orderBy('treatment_sessions.time', 'desc');

            if ($estado !== 'all') {
                $sessionsQuery->where('treatment_sessions.status', $estado);
            }

            if (!empty($query)) {
                $sessionsQuery->whereHas('patient', function ($q) use ($query) {
                    $q->where(DB::raw("LOWER(CONCAT(patients.name, ' ', patients.last_name))"), 'like', '%' . strtolower($query) . '%')
                        ->orWhere('patients.rut', 'like', "%{$query}%");
                })->orWhereHas('doctor', function ($q) use ($query) {
                    $q->where(DB::raw("LOWER(CONCAT(doctors.name, ' ', doctors.last_name))"), 'like', '%' . strtolower($query) . '%');
                });
            }

            $sessions = $sessionsQuery->get();

            $atenciones = $sessions->map(function ($session) {
                $activeItem = $session->invoiceItems->first(function ($item) {
                    return $item->invoice && 
                        $item->invoice->payment_status !== FinanceStatusEnum::VOIDED && 
                        $item->invoice->dte_status !== DteStatusEnum::REJECTED;
                });

                $activeInvoice = $activeItem ? $activeItem->invoice : null;

                return [
                    'session_id' => $session->id,
                    'patient_id' => $session->patient_id,
                    'patient_full_name' => $session->patient?->full_name ?? 'N/A',
                    'doctor_full_name' => $session->doctor?->full_name ?? 'N/A',
                    'name_session_type' => $session->item?->name ?? 'Servicio',
                    'date' => $session->date->toDateString(),
                    'time' => $session->time?->format('H:i'),
                    'status' => $session->status instanceof AppointmentStatusEnum ? $session->status->value : $session->status,
                    'month_session_number' => $session->month_session_number,
                    'patient_amount_clp' => $session->patient_amount_clp,
                    
                    'pain_before' => $session->pain_before,
                    'pain_after' => $session->pain_after,
                    'techniques' => $session->techniques ?? [],
                    'exercises' => $session->exercises ?? [],
                    'notes' => $session->notes,
                    'homework' => $session->homework,
                    'next_goals' => $session->next_goals,

                    'billing_info' => $activeInvoice ? [
                        'invoice_id'      => $activeInvoice->id,
                        'status_internal' => $activeInvoice->payment_status, 
                        'dte_status'      => $activeInvoice->dte_status,     
                        'folio'           => $activeInvoice->dte_folio,      
                        'type'            => $activeInvoice->dte_type,       
                        'pdf_path'        => $activeInvoice->pdf_path,       
                    ] : null,
                    'is_locked'       => $activeInvoice ? true : false,      
                    'dte_generated'   => $activeInvoice && $activeInvoice->dte_status === DteStatusEnum::ACCEPTED,
                ];
            });

            $kpis = [
                'total' => $sessions->count(),
                'completadas' => $sessions->where('status', AppointmentStatusEnum::COMPLETED)->count(),
                'pendientes' => $sessions->whereIn('status', [AppointmentStatusEnum::SCHEDULED, AppointmentStatusEnum::CHECKED_IN])->count(),
                'canceladas' => $sessions->where('status', AppointmentStatusEnum::CANCELLED)->count(),
                'totalCobrado' => $sessions->sum(function($s) {
                    return $s->invoiceItems->sum(function($ii) {
                        return $ii->invoice ? $ii->invoice->amount_paid : 0;
                    });
                }),
                'totalPorCobrar' => $sessions->sum('patient_amount_clp'),
            ];


            return Inertia::render('attendances/index', [
                'atenciones' => $atenciones,
                'kpis' => $kpis,
                'filtros' => [
                    'fecha_inicio' => $fechaInicio,
                    'fecha_fin' => $fechaFin,
                    'estado' => $estado,
                    'query' => $query,
                ],
                'patients' => Patient::get()->map(fn($p) => [
                    'id' => $p->id,
                    'full_name' => $p->full_name,
                    'rut' => $p->rut,
                ]),
                'doctors' => Doctor::get()->map(fn($d) => [
                    'id' => $d->id,
                    'full_name' => $d->full_name,
                ]),
                'session_types' => Item::services()->get()->map(fn($i) => [
                    'id' => $i->id,
                    'name' => $i->name,
                    'price' => (int)$i->price,
                ]),
                'diagnostics' => Diagnostic::where('is_active', true)->get(['code', 'description']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar sesiones: ' . $e->getMessage());
            return back()->with('error', 'Error al cargar las sesiones');
        }
    }

    /**
     * Inicia una sesión (CHECKED_IN -> IN_PROGRESS)
     */
    public function start(TreatmentSession $session)
    {
        try {
            if ($session->status !== AppointmentStatusEnum::CHECKED_IN && $session->status !== AppointmentStatusEnum::SCHEDULED) {
                return back()->with('error', 'Solo se pueden iniciar sesiones programadas o en recepción.');
            }

            $session->update([
                'status' => AppointmentStatusEnum::IN_PROGRESS,
                'started_at' => now(),
            ]);

            if ($session->appointment) {
                $session->appointment->update(['status' => AppointmentStatusEnum::IN_PROGRESS]);
            }

            return back()->with('success', 'Sesión iniciada.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al iniciar la sesión.');
        }
    }

    /**
     * Finaliza una sesión con datos clínicos.
     */
    public function complete(Request $request, TreatmentSession $session)
    {
        try {
            $this->sessionService->completeSession($session, $request->all());

            if ($session->appointment) {
                $session->appointment->update(['status' => AppointmentStatusEnum::COMPLETED]);
            }

            return back()->with('success', 'Sesión completada y guardada.');
        } catch (\Exception $e) {
            Log::error("Error al completar sesión: " . $e->getMessage());
            return back()->with('error', 'Error al completar la sesión.');
        }
    }

    /**
     * Marca sesión como ausente.
     */
    public function absent(TreatmentSession $session)
    {
        try {
            $this->sessionService->markAsNoShow($session);

            if ($session->appointment) {
                $session->appointment->update(['status' => AppointmentStatusEnum::NO_SHOW]);
            }

            return back()->with('success', 'Paciente marcado como ausente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar la ausencia.');
        }
    }

    /**
     * Cancela la sesión.
     */
    public function cancel(Request $request, TreatmentSession $session)
    {
        try {
            $this->sessionService->cancelSession($session, $request->input('notes'));

            if ($session->appointment) {
                $session->appointment->update(['status' => AppointmentStatusEnum::CANCELLED]);
            }

            return back()->with('success', 'Sesión cancelada.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al cancelar la sesión.');
        }
    }

    public function store(StoreTreatmentSessionRequest $request)
    {
        try {
            $this->sessionService->createSession($request->validated());
            return back()->with('success', 'Sesión creada exitosamente.');
        } catch (\Exception $e) {
            Log::error("Error al crear sesión: " . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    public function update(UpdateTreatmentSessionRequest $request, TreatmentSession $session)
    {
        try {
            $this->sessionService->updateSession($session, $request->validated());
            return back()->with('success', 'Sesión actualizada.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(TreatmentSession $session)
    {
        try {
            if ($session->isCompleted()) {
                return back()->with('error', 'No se puede eliminar una sesión completada.');
            }
            $this->sessionService->deleteSession($session);
            return back()->with('success', 'Sesión eliminada.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function notify(TreatmentSession $session)
    {
        try {
            $this->sessionService->notifyPatient($session);
            return back()->with('success', 'Notificación enviada.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function duplicate(TreatmentSession $session)
    {
        try {
            $newSession = $session->replicate(['appointment_id', 'date', 'time', 'status', 'signed_at']);
            $newSession->status = AppointmentStatusEnum::SCHEDULED;
            $newSession->date = now()->addWeek()->toDateString();
            $newSession->save();
            return back()->with('success', 'Sesión duplicada.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
