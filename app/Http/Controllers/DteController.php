<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use App\Services\Dte\DteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DteController extends Controller
{
    protected DteService $dteService;

    /**
     * Inyección del proveedor de servicios DTE.
     * Solo necesitamos la interface del servicio de emisión.
     */
    public function __construct(DteService $dteService)
    {
        $this->dteService = $dteService;
    }

    public function index()
    {
        /* $pacientes = Patient::orderBy('name')->get();
        $productos = SessionType::orderBy('name')->get();
        return Inertia::render('Boletas/Crear', [
            'pacientes' => $pacientes,
            'productos' => $productos,
        ]); */
        $companyId = auth()->user()->company_id;

        $branches = Branch::where('company_id', $companyId)->orderBy('name')->get();
        $patients = Patient::whereHas('companies', function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->select('id', 'name','last_name', 'rut')->get();
        $doctors = Doctor::whereHas('companies', function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->select('id', 'name','last_name', 'rut')->get();

        return Inertia::render('Documents/ChileTaxDocuments',[
            'branches' => $branches, 
            'patients' => $patients,
            'doctors'  => $doctors
        ]);
    }

    public function store(Request $request)
    {
        // 1. Persistencia: Crear la factura interna (Invoice)
        // Lógica para validar y guardar Invoice, InvoiceItems, etc.
        $invoice = $this->guardarNuevaFactura($request->all()); 
        
        // 2. Delegación: Llamar al servicio de negocio para procesar el DTE
        try {
            // El DteService se encargará de buscar la config, llamar a LibreDteLocalProvider::issue(), etc.
            $trackId = $this->dteService->issueInvoiceDte($invoice); 
            
            // 3. Respuesta: Devolver una respuesta exitosa.
            return inertia()->location(route('invoices.show', $invoice->id));
            
        } catch (\Exception $e) {
            // Manejo de errores de DTE
            return back()->withErrors(['dte_error' => 'Error DTE: ' . $e->getMessage()]);
        }
    }

    // -----------------------------------------------------------------

    /**
     * Consulta el estado de un DTE enviado previamente al SII.
     */
    public function checkDteStatus(int $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);

        if (!$invoice->dte_track_id) {
            return response()->json(['message' => 'La factura no tiene un Track ID de envío registrado.'], 404);
        }
        
        try {
            $status = $this->dteService->checkDteStatus($invoice->dte_track_id, $invoice->company_id);

            // Opcional: actualizar el estado si es terminal
            if (in_array($status['estado'], ['ACEPTADO', 'RECHAZADO'])) {
                $invoice->update(['dte_status' => $status['estado']]);
            }

            return response()->json([
                'track_id' => $invoice->dte_track_id,
                'estado_sii' => $status['estado'],
                'glosa_sii' => $status['glosa'],
            ]);

        } catch (\Exception $e) {
             return response()->json(['error' => 'Error al consultar estado: ' . $e->getMessage()], 500);
        }
    }
}