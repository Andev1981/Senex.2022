<?php

namespace App\Http\Controllers\Admin\Payments;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Patient;
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
            ->withCount(['invoices as pending_invoices_count' => function ($q) {
                $q->whereIn('payment_status', ['unpaid', 'partial'])
                  ->where('amount_total_clp', '>', 0);
            }])
            // Sumar el total original de las facturas impagas (aproximación, idealmente sería el saldo)
            // Para saldo exacto necesitaríamos subquería compleja o calcular en PHP.
            // Por simplicidad en SQL, sumamos el total de facturas impagas.
            ->withSum(['invoices as pending_amount' => function ($q) {
                $q->whereIn('payment_status', ['unpaid', 'partial']);
            }], 'amount_total_clp')
            ->having('pending_invoices_count', '>', 0);

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

        return Inertia::render('admin/PaymentReminders/Index', [
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

        // Calcular deuda del paciente (Facturas impagas)
        $invoices = Invoice::where('patient_id', $patient->id)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->where('amount_total_clp', '>', 0)
            ->with('paymentAllocations')
            ->get();

        $totalDebt = 0;
        foreach ($invoices as $inv) {
            $paid = $inv->paymentAllocations->sum('amount_clp');
            $balance = $inv->amount_total_clp - $paid;
            if ($balance > 0) {
                $totalDebt += $balance;
            }
        }
        
        $count = $invoices->count();

        if ($totalDebt <= 0) {
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
            (int) $totalDebt,
            (int) $count,
            array_values($channels)
        ));

        // Log
        Log::info('Recordatorio de pago enviado', [
            'patient_id' => $patient->id,
            'channels' => $channels,
            'total' => $totalDebt,
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
            // Calcular deuda real
            $invoices = Invoice::where('patient_id', $patient->id)
                ->whereIn('payment_status', ['unpaid', 'partial'])
                ->where('amount_total_clp', '>', 0)
                ->with('paymentAllocations')
                ->get();

            $totalDebt = 0;
            foreach ($invoices as $inv) {
                $paid = $inv->paymentAllocations->sum('amount_clp');
                $balance = $inv->amount_total_clp - $paid;
                if ($balance > 0) $totalDebt += $balance;
            }

            if ($totalDebt <= 0) {
                $failed++;
                continue;
            }

            $count = $invoices->count();
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
                    (int) $totalDebt,
                    (int) $count,
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
            'total_patients_with_debt' => Patient::whereHas('invoices', function ($q) {
                $q->whereIn('payment_status', ['unpaid', 'partial'])
                  ->where('amount_total_clp', '>', 0);
            })->count(),

            'total_pending_amount' => (int) Invoice::whereIn('payment_status', ['unpaid', 'partial'])
                ->sum('amount_total_clp'), // Nota: Esto suma el total, no el saldo pendiente exacto. Para exactitud requeriría query compleja.

            'total_pending_sessions' => Invoice::whereIn('payment_status', ['unpaid', 'partial'])
                ->count(),
        ];
    }
}