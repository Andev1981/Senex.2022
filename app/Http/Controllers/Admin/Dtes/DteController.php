<?php

namespace App\Http\Controllers\Admin\Dtes;

use App\Http\Controllers\Controller;
use App\Models\AuthorizedFolio;
use App\Models\Company;
use App\Models\Dte;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Plan;
use App\Models\Item;
use App\Services\Dte\DteCalculatorService;
use App\Services\Dte\DteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DteController extends Controller
{
    public function index(Request $request)
    {
        $companyId = session('current_company_id');
        $company = Company::with('dteConfiguration')->findOrFail($companyId);

        // 1. Obtener Facturas que aún no tienen DTE emitido (o están en RETRY)
        $pendingInvoices = Invoice::where('company_id', $companyId)
            ->whereIn('dte_status', ['none', 'retry'])
            ->with(['patient', 'items'])
            ->latest()
            ->get();

        // 2. Obtener Historial de DTEs emitidos
        $dtes = Dte::where('company_id', $companyId)
            ->with(['origin.patient']) // Asumiendo que origin es la factura
            ->orderBy('id', 'desc')
            ->paginate(15);

        // 3. Obtener Catálogo Maestro Unificado para emisión manual
        $catalog = Item::where('company_id', $companyId)
            ->where('is_active', true)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'unique_id' => ($item->type === 'product' ? 'prod_' : 'serv_') . $item->id,
                    'name' => $item->name,
                    'price' => (int)$item->price,
                    'type' => $item->type === 'product' ? 'Producto' : 'Servicio',
                    'is_exempt' => (bool)$item->is_exempt,
                    'sellable_type' => 'Item',
                    'sku' => $item->sku,
                ];
            });

        $plans = Plan::where('company_id', $companyId)->with('items')->where('is_active', true)
            ->get()
            ->map(function ($p) {
                $sessionsSummary = $p->items->map(function($st) {
                    $count = $st->pivot->max_sessions ?? 'ILIMITADO';
                    return "{$st->name} ({$count})";
                })->implode(', ');

                return [
                    'id' => $p->id,
                    'unique_id' => 'plan_' . $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'type' => 'Plan',
                    'is_exempt' => true,
                    'sellable_type' => 'Plan',
                    'sessions_summary' => $sessionsSummary
                ];
            });

        // Concatenar todo en una lista maestra para el selector del frontend
        $masterItems = $catalog->concat($plans);

        return Inertia::render('documents/IndexDocuments', [
            'company' => $company,
            'pendingInvoices' => $pendingInvoices,
            'dtes' => $dtes,
            'masterItems' => $masterItems,
            'patients' => Patient::all(['id', 'name', 'last_name', 'rut', 'email', 'phone']),
        ]);
    }

    public function issueDte(Invoice $invoice)
    {
        try {
            $dteService = app(DteService::class);
            $trackId = $dteService->issueInvoiceDte($invoice);

            return back()->with('success', "DTE emitido exitosamente. TrackID: {$trackId}");
        } catch (\Exception $e) {
            Log::error('Error en emisión manual DTE', ['invoice_id' => $invoice->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Error al emitir DTE: ' . $e->getMessage());
        }
    }

    public function checkDteStatus(Invoice $invoice)
    {
        try {
            $dteService = app(DteService::class);
            $status = $dteService->syncDteStatus($invoice);

            return back()->with('info', "Estado del DTE: {$status}");
        } catch (\Exception $e) {
            return back()->with('error', 'Error al consultar estado: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'dte_type' => 'required|in:33,39,41',
            'items' => 'required|array|min:1',
            'items.*.sellable_id' => 'required',
            'items.*.sellable_type' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            return DB::transaction(function() use ($validated) {
                // 1. Crear Factura "Huérfana" (Sin Pago previo, ya que se está creando manual)
                $invoice = new Invoice();
                $invoice->company_id = session('current_company_id');
                $invoice->patient_id = $validated['patient_id'];
                $invoice->user_id = auth()->id();
                $invoice->dte_type = $validated['dte_type'];
                $invoice->issue_date = now();
                $invoice->dte_status = 'none';
                $invoice->payment_status = 'pending';
                $invoice->save();

                // 2. Agregar ítems
                foreach ($validated['items'] as $item) {
                    $invoice->items()->create([
                        'company_id' => $invoice->company_id,
                        'sellable_type' => $item['sellable_type'],
                        'sellable_id' => $item['sellable_id'],
                        'description' => $item['name'] ?? 'Venta manual',
                        'quantity' => $item['quantity'],
                        'unit_price_clp' => $item['unit_price'],
                        'total_gross_clp' => $item['unit_price'] * $item['quantity'],
                        'is_exento' => $item['is_exempt'] ?? true,
                    ]);
                }

                // 3. Calcular totales finales
                app(DteCalculatorService::class)->calculateAndDetermineType($invoice);

                return back()->with('success', 'Documento registrado. Ahora puedes proceder a la emisión.');
            });
        } catch (\Exception $e) {
            return back()->with('error', 'Error al registrar documento: ' . $e->getMessage());
        }
    }

    public function consultContribuyente($rut)
    {
        try {
            $dteService = app(DteService::class);
            $data = $dteService->getContribuyenteInfo($rut);

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    public function lookupByFolio($folio)
    {
        // Lógica para buscar DTE por folio en el SII si fuera necesario
        return response()->json(['status' => 'not_implemented']);
    }
}
