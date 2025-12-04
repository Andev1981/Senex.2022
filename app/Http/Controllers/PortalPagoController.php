<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalPagoController extends Controller
{
    /**
     * Vista principal pública (Ingreso Manual)
     * URL: /pagar
     */
    public function index()
    {
        return Inertia::render('PaymentsPatients/PortalPago', [
            'mode' => 'manual', // Indica al frontend que pida el RUT
        ]);
    }

    /**
     * Entrada via Link Mágico (WhatsApp/Mail)
     * URL: /pagar/auto/{rut}?signature=...
     */
    public function magicLink(Request $request, $rut)
    {
        // 1. Validar que el link no haya sido manipulado
        // Si usas el middleware 'signed' en la ruta, esto ya está cubierto,
        // pero nunca está de más una verificación extra o lógica de expiración custom.
        if (! $request->hasValidSignature()) {
            return redirect()->route('portal.pago.index')
                ->with('error', 'El enlace ha expirado o no es válido.');
        }

        // 2. Buscar al paciente
        $patient = Patient::where('rut', $rut)->first();

        if (!$patient) {
            return redirect()->route('portal.pago.index')
                ->with('error', 'Paciente no encontrado.');
        }

        // 3. Obtener Deudas (Reutiliza tu lógica de consulta de deudas aquí)
        // Estoy asumiendo una relación o consulta simple, ajústalo a tu modelo Debt
        $debts = Debt::where('patient_id', $patient->id)
                     ->where('status', 'pending') // O el estado que uses
                     ->get();

        // 4. Renderizar DIRECTO la vista de resultados/deudas
        // Pasamos 'preloadedData' para que React sepa que ya tiene la info
        return Inertia::render('PaymentsPatients/PortalPago', [
            'mode' => 'auto',
            'preloadedPatient' => [
                'rut' => $patient->rut,
                'name' => $patient->first_name, // Solo nombre de pila por privacidad en pantalla
            ],
            'preloadedDebts' => $debts
        ]);
    }

    /**
     * API para consulta manual (cuando el usuario escribe el RUT en la web)
     */
    public function consultarDeudas(Request $request)
    {
        $request->validate(['rut' => 'required']);
        
        $patient = Patient::where('rut', $request->rut)->first();
        
        if (!$patient) {
            return response()->json(['debts' => []]);
        }

        $debts = Debt::where('patient_id', $patient->id)
                     ->where('status', 'pending')
                     ->get();

        return response()->json([
            'patient' => ['rut' => $patient->rut, 'name' => $patient->first_name],
            'debts' => $debts
        ]);
    }
}