<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Patient;
use App\Models\Session;
use App\Models\TreatmentSession;
use App\Notifications\PaymentReminderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentReminderController extends Controller
{
    /**
     * Lista de pacientes con deudas pendientes
     */
    public function index(Request $request)
    {
        $query = Patient::query()
            ->withCount(['sessions as pending_sessions_count' => function ($q) {
                $q->where('payment_status', 'pending')
                  ->whereNotNull('price')
                  ->where('price', '>', 0);
            }])
            ->withSum(['sessions as pending_amount' => function ($q) {
                $q->where('payment_status', 'pending')
                  ->whereNotNull('price')
                  ->where('price', '>', 0);
            }], 'price')
            ->having('pending_sessions_count', '>', 0);

        // Filtro por búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('rut', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Ordenar por monto pendiente (mayor primero)
        $query->orderByDesc('pending_amount');

        $patients = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/PaymentReminders/Index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
            'stats' => $this->getStats(),
        ]);
    }

    /**
     * Enviar recordatorio a un paciente
     */
    public function send(Request $request, Patient $patient)
    {
        $request->validate([
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['in:mail,sms,whatsapp'],
        ]);

        // Calcular deuda del paciente
        $deuda = Debt::where('patient_id', $patient->id)
            ->where('payment_status', 'pending')
            ->whereNotNull('price')
            ->where('price', '>', 0)
            ->selectRaw('SUM(price) as total, COUNT(*) as count')
            ->first();

        if (!$deuda || $deuda->total <= 0) {
            return back()->with('error', 'Este paciente no tiene deudas pendientes.');
        }

        // Validar canales disponibles
        $channels = $request->channels;
        $errors = [];

        if (in_array('mail', $channels) && !$patient->email) {
            $errors[] = 'No tiene email registrado';
            $channels = array_diff($channels, ['mail']);
        }

        if ((in_array('sms', $channels) || in_array('whatsapp', $channels)) && !$patient->phone) {
            $errors[] = 'No tiene teléfono registrado';
            $channels = array_diff($channels, ['sms', 'whatsapp']);
        }

        if (empty($channels)) {
            return back()->with('error', 'No se pudo enviar: ' . implode(', ', $errors));
        }

        // Enviar notificación
        $patient->notify(new PaymentReminderNotification(
            (int) $deuda->total,
            (int) $deuda->count,
            array_values($channels)
        ));

        // Log
        Log::info('Recordatorio de pago enviado', [
            'patient_id' => $patient->id,
            'channels' => $channels,
            'total' => $deuda->total,
            'admin_id' => auth()->id(),
        ]);

        $channelNames = [
            'mail' => 'Email',
            'sms' => 'SMS',
            'whatsapp' => 'WhatsApp',
        ];

        $sentChannels = array_map(fn($c) => $channelNames[$c] ?? $c, $channels);
        
        return back()->with('success', 'Recordatorio enviado por: ' . implode(', ', $sentChannels));
    }

    /**
     * Enviar recordatorios masivos
     */
    public function sendBulk(Request $request)
    {
        $request->validate([
            'patient_ids' => ['required', 'array', 'min:1'],
            'patient_ids.*' => ['integer', 'exists:patients,id'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['in:mail,sms,whatsapp'],
        ]);

        $patients = Patient::whereIn('id', $request->patient_ids)->get();
        $sent = 0;
        $failed = 0;

        foreach ($patients as $patient) {
            $deuda = Debt::where('patient_id', $patient->id)
                ->where('payment_status', 'pending')
                ->whereNotNull('price')
                ->where('price', '>', 0)
                ->selectRaw('SUM(price) as total, COUNT(*) as count')
                ->first();

            if (!$deuda || $deuda->total <= 0) {
                $failed++;
                continue;
            }

            $channels = $request->channels;

            // Filtrar canales según datos del paciente
            if (in_array('mail', $channels) && !$patient->email) {
                $channels = array_diff($channels, ['mail']);
            }
            if ((in_array('sms', $channels) || in_array('whatsapp', $channels)) && !$patient->phone) {
                $channels = array_diff($channels, ['sms', 'whatsapp']);
            }

            if (empty($channels)) {
                $failed++;
                continue;
            }

            try {
                $patient->notify(new PaymentReminderNotification(
                    (int) $deuda->total,
                    (int) $deuda->count,
                    array_values($channels)
                ));
                $sent++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Error enviando recordatorio masivo', [
                    'patient_id' => $patient->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', "Recordatorios enviados: {$sent}. Fallidos: {$failed}.");
    }

    /**
     * Estadísticas generales
     */
    private function getStats(): array
    {
        return [
            'total_patients_with_debt' => Patient::whereHas('sessions', function ($q) {
                $q->where('payment_status', 'pending')
                  ->whereNotNull('price')
                  ->where('price', '>', 0);
            })->count(),

            'total_pending_amount' => (int) TreatmentSession::where('payment_status', 'pending')
                ->whereNotNull('price')
                ->where('price', '>', 0)
                ->sum('price'),

            'total_pending_sessions' => TreatmentSession::where('payment_status', 'pending')
                ->whereNotNull('price')
                ->where('price', '>', 0)
                ->count(),
        ];
    }
}