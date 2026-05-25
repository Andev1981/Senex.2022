<?php

namespace App\Http\Controllers\Admin\Clients;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientDashboardController extends Controller
{
    /**
     * Mostrar el dashboard del paciente con su historial unificado.
     * GET /patient/dashboard
     */
    public function index()
    {
        $patient = Auth::guard('patient')->user();

        if (!$patient) {
            return redirect()->route('patient.login');
        }

        // Cargar relaciones necesarias
        $patient->load([
            'invoices' => fn($q) => $q->latest(),
            'treatments.item',
            'treatmentSessions.item',
            'treatmentSessions.doctor',
            'payments' => fn($q) => $q->latest()
        ]);

        // --- CONSTRUCCIÓN DEL HISTORIAL UNIFICADO ---
        $history = collect();

        // 1. Sesiones (Atenciones)
        foreach ($patient->treatmentSessions as $session) {
            $history->push([
                'type' => 'session',
                'id' => $session->id,
                'date' => $session->date ? $session->date->format('Y-m-d') : null,
                'time' => $session->time ? $session->time->format('H:i') : null,
                'title' => $session->item->name ?? 'Sesión Médica',
                'subtitle' => "Atendido por " . ($session->doctor->full_name ?? 'Especialista'),
                'status' => $session->status instanceof \UnitEnum ? $session->status->value : $session->status,
                'amount' => 0,
                'meta' => [
                    'pain_level' => $session->pain_before,
                    'pain_map' => $session->pain_map,
                ]
            ]);
        }

        // 2. Inicio de Tratamientos
        foreach ($patient->treatments as $treatment) {
            $history->push([
                'type' => 'treatment',
                'id' => $treatment->id,
                'date' => $treatment->start_date ? $treatment->start_date->format('Y-m-d') : null,
                'title' => 'Inicio de Tratamiento: ' . ($treatment->item->name ?? 'Kinesiología'),
                'subtitle' => $treatment->diagnosis ?? 'Sin diagnóstico especificado',
                'status' => 'completed',
                'amount' => 0,
            ]);
        }

        // 3. Pagos realizados
        foreach ($patient->payments as $payment) {
            $history->push([
                'type' => 'payment',
                'id' => $payment->id,
                'date' => $payment->paid_at ? $payment->paid_at->format('Y-m-d') : ($payment->payment_date ? $payment->payment_date->format('Y-m-d') : null),
                'time' => $payment->paid_at ? $payment->paid_at->format('H:i') : null,
                'title' => 'Pago Recibido',
                'subtitle' => "Vía " . strtoupper($payment->payment_method ?? 'Caja'),
                'status' => 'completed',
                'amount' => (int)$payment->amount_clp,
            ]);
        }

        // Ordenar cronológicamente (más reciente primero)
        $history = $history->filter(fn($e) => !empty($e['date']))
            ->sortByDesc(fn($e) => $e['date'] . ' ' . ($e['time'] ?? '00:00'))
            ->values();

        return Inertia::render('patients/dashboard/patient-dashboard', [
            'patient' => $patient,
            'history' => $history,
            'treatments' => $patient->treatments,
            'sessions' => $patient->treatmentSessions, // Para el gráfico de evolución
        ]);
    }
}
