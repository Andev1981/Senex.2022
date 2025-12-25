<?php

namespace App\Http\Controllers;

use App\Models\Receivable;
use App\Models\ReceivablePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReceivableController extends Controller
{
    // Listado de Deudores
    public function index(Request $request)
    {
        $query = Receivable::with(['customer', 'invoice'])
            ->where('balance', '>', 0) // Solo mostrar quienes deben
            ->orderBy('due_date', 'asc'); // Los más urgentes primero

        return Inertia::render('Finance/Receivables/Index', [
            'receivables' => $query->paginate(20),
            'total_pending' => $query->sum('balance') // KPI rápido
        ]);
    }

    // Registrar un Abono
    public function storePayment(Request $request, Receivable $receivable)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:' . $receivable->balance,
            'payment_method' => 'required|string',
            'payment_date' => 'required|date'
        ]);

        DB::transaction(function () use ($request, $receivable) {
            // 1. Crear el registro del abono
            ReceivablePayment::create([
                'receivable_id' => $receivable->id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'reference' => $request->reference,
                'user_id' => auth()->id()
            ]);

            // 2. Actualizar la deuda principal
            $receivable->amount_paid += $request->amount;
            $receivable->balance = $receivable->amount_total - $receivable->amount_paid;

            // 3. Actualizar estado
            if ($receivable->balance <= 0) {
                $receivable->status = 'paid';
            } else {
                $receivable->status = 'partial';
            }

            $receivable->save();

            // Opcional: Actualizar el estado de la Invoice original también
        });

        return back()->with('success', 'Abono registrado correctamente.');
    }
}
