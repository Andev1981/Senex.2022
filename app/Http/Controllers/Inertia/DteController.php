<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\SessionType;
use App\Services\Dte\DteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DteController extends Controller
{
    public function __construct(private DteService $dte) {}

    public function crear()
    {
        /* $pacientes = Patient::orderBy('name')->get();
        $productos = SessionType::orderBy('name')->get();
        return Inertia::render('Boletas/Crear', [
            'pacientes' => $pacientes,
            'productos' => $productos,
        ]); */

        return Inertia::render('Documents/ChileTaxDocuments');
    }

    /**
     * Emite un DTE para una factura.
     * POST /dte/emit
     *
     * Body JSON:
     * {
     *   "invoice_id": 123,
     *   "tipo_documento": 39,     // 33,34,39,41,52,56,61
     *   "send_to_sii": true       // opcional (default true)
     * }
     */
    public function emit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'invoice_id'     => ['required', 'integer', 'exists:invoices,id'],
            'tipo_documento' => ['required', 'integer', 'in:33,34,39,41,52,56,61'],
            'send_to_sii'    => ['nullable', 'boolean'],
        ]);

        $invoice = Invoice::with(['items', 'patient', 'company'])->findOrFail($data['invoice_id']);

        try {
            $resp = $this->dte->emit($invoice, [
                'type'        => (int)$data['tipo_documento'],
                'send_to_sii' => $data['send_to_sii'] ?? true,
            ]);

            return response()->json([
                'ok'        => true,
                'message'   => 'DTE emitido',
                'folio'     => $resp['folio'] ?? null,
                'track_id'  => $resp['track_id'] ?? null,
                'status'    => $resp['status'] ?? null,
                'raw'       => $resp['raw'] ?? null,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'ok'      => false,
                'error'   => 'No se pudo emitir el DTE',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Consulta el estado de un DTE previamente emitido (si el proveedor lo soporta).
     * POST /dte/check
     *
     * Body JSON:
     * {
     *   "invoice_id": 123
     * }
     */
    public function check(Request $request): JsonResponse
    {
        $data = $request->validate([
            'invoice_id' => ['required', 'integer', 'exists:invoices,id'],
        ]);

        $invoice = Invoice::findOrFail($data['invoice_id']);

        if (! $invoice->track_id) {
            return response()->json([
                'ok'    => false,
                'error' => 'La factura no tiene track_id asociado',
            ], 422);
        }

        $resp = $this->dte->checkStatus($invoice);

        if ($resp === null) {
            return response()->json([
                'ok'    => false,
                'error' => 'Proveedor sin soporte de estado o error consultando',
            ], 400);
        }

        return response()->json([
            'ok'     => true,
            'estado' => $resp['estado'] ?? null,  // ACEPTADO / RECHAZADO / EN_PROCESO
            'glosa'  => $resp['glosa']  ?? null,
            'raw'    => $resp['raw']    ?? $resp,
        ]);
    }
}
