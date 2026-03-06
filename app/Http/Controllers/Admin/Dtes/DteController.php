<?php

namespace App\Http\Controllers\Admin\Dtes;

use App\Http\Controllers\Controller;
use App\Models\AuthorizedFolio;
use App\Models\Branch;
use App\Models\Commune;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Plan;
use App\Models\Product;
use App\Models\SessionType;
use App\Services\Dte\DteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DteController extends Controller
{
    protected DteService $dteService;

    public function __construct(DteService $dteService)
    {
        $this->dteService = $dteService;
    }

    public function index()
    {
        $this->authorize('viewAny', Invoice::class);
        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');

        $branches = Branch::where('company_id', $currentCompanyId)->orderBy('name')->get();
        $patients = Patient::when($activeBranchId, function ($query) use ($activeBranchId) {
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->with(['address.commune.province.region', 'insurances'])
            ->get()
            ->unique('id') // Added to prevent duplicate keys in React
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'last_name' => $p->last_name,
                    'full_name' => $p->full_name,
                    'rut' => $p->rut,
                    'insurance_name' => $p->insurances->first()?->name ?? 'Particular',
                    'address' => $p->address ? [
                        'street' => $p->address->street,
                        'number' => $p->address->number,
                        'commune_name' => $p->address->commune?->name,
                        'region_name' => $p->address->commune?->province?->region?->name
                    ] : null
                ];
            });

        $doctors = Doctor::when($activeBranchId, function ($query) use ($activeBranchId) {
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->select('id', 'name', 'last_name', 'rut')->get();

        $invoices = Invoice::with('patient', 'items', 'dtes', 'currentDte')->where('branch_id', $activeBranchId)->orderByDesc('created_at')->get();

        $communes = Commune::with('province.region')
            ->orderBy('name')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'region_name' => $c->province?->region?->name ?? 'Sin Región'
                ];
            });

        $products = Product::where('is_active', true)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'unique_id' => 'prod_' . $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'type' => 'Producto',
                    'is_exempt' => $p->is_exempt ?? false,
                    'sellable_type' => 'Product',
                    'sku' => $p->sku, // Added
                ];
            });

        $services = SessionType::where('is_active', true)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'unique_id' => 'serv_' . $s->id,
                    'name' => $s->name,
                    'price' => $s->base_price_clp,
                    'type' => 'Servicio',
                    'is_exempt' => (bool)$s->is_exempt,
                    'sellable_type' => 'SessionType',
                    'code' => $s->code, // Added
                ];
            });

        $plans = Plan::with('sessionTypes')->where('is_active', true)
            ->get()
            ->map(function ($p) {
                // Generar resumen de sesiones: "Kine (10), Masaje (5)"
                $sessionsSummary = $p->sessionTypes->map(function($st) {
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
                    'details' => $sessionsSummary, // Added
                    'valid_months' => $p->valid_months, // Added
                ];
            });

        $sellables = $products->concat($services)->concat($plans)->values();

        /* dd($sellables,$products, $services,$plans); */

        $cafStats = AuthorizedFolio::where('company_id', $currentCompanyId)
            ->where('activo', true)
            ->select('tipo_dte', 'folio_desde', 'folio_hasta', 'ultimo_folio_usado')
            ->get()
            ->map(function ($f) {
                $total = ($f->folio_hasta - $f->folio_desde) + 1;
                $used = max(0, $f->ultimo_folio_usado - $f->folio_desde + 1);
                return [
                    'type' => $f->tipo_dte,
                    'from' => $f->folio_desde,
                    'to' => $f->folio_hasta,
                    'used' => $used,
                    'total' => $total,
                    'available' => max(0, $f->folio_hasta - $f->ultimo_folio_usado),
                ];
            });

        $currentCompany = Company::with('dteConfiguration')->find($currentCompanyId);

        return Inertia::render('documents/IndexDocuments', [
            'company' => $currentCompany,
            'dte_config' => $currentCompany->dteConfiguration,
            'is_configured' => !!$currentCompany->dteConfiguration,
            'branches' => $branches,
            'patients' => $patients,
            'doctors'  => $doctors,
            'invoices' => $invoices,
            'communes' => $communes,
            'sellables' => $sellables,
            'caf_stats' => $cafStats,
        ]);
    }

    public function consultContribuyente(string $rut)
    {
        try {
            $rutLimpio = preg_replace('/[^0-9Kk]/', '', strtoupper($rut));
            if (strlen($rutLimpio) < 8) {
                return response()->json(['success' => false, 'message' => 'RUT inválido'], 422);
            }

            // Asegurar formato con guion para SRE
            $rutFormateado = substr($rutLimpio, 0, -1) . '-' . substr($rutLimpio, -1);

            $response = Http::timeout(10)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'])
                ->get("https://sre.cl/api/company_info", [
                    'token' => 'token_publico',
                    'rut' => $rutFormateado,
                    'version' => '2.0'
                ]);

            if (!$response->successful()) {
                // Si la API falla (503), devolvemos un éxito falso pero con mensaje para que el usuario proceda manual
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio de validación SII temporalmente fuera de línea. Por favor, ingrese los datos manualmente.'
                ], 200);
            }

            $data = $response->json();

            if (isset($data['status']) && $data['status'] === 'Error') {
                return response()->json(['success' => false, 'message' => 'RUT no encontrado en registros oficiales.'], 404);
            }

            $rutNum = (int)substr($rutLimpio, 0, -1);
            $esEmpresa = $rutNum > 50000000;

            return response()->json([
                'success' => true,
                'razon_social' => $data['razon_social'] ?? 'Sin Razón Social',
                'giro' => $data['glosa_giro'] ?? 'Particular',
                'direccion' => $data['direccion_sucursal'] ?? $data['direccion'] ?? '',
                'comuna' => $data['comuna'] ?? '',
                'es_empresa' => $esEmpresa
            ]);
        } catch (\Exception $e) {
            Log::error("RUT_CONSULT_ERROR: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error de conexión'], 500);
        }
    }

    public function store(Request $request)
    {
        $this->authorize('create', Invoice::class);
        if (in_array($request->dte_type, [61, 56])) {
            $refFolio = $request->reference_doc;
            if (!$refFolio) return back()->withErrors(['reference_doc' => 'Indique folio de referencia.']);

            $originalInvoice = Invoice::where('dte_folio', $refFolio)
                ->where('company_id', session('current_company_id'))
                ->whereIn('dte_type', [33, 34, 39, 41])
                ->first();

            if (!$originalInvoice) return back()->withErrors(['reference_doc' => "Folio {$refFolio} no encontrado."]);

            if ($originalInvoice->dte_status !== 'accepted' && !$request->boolean('simulate')) {
                return back()->withErrors(['reference_doc' => "Documento original no está ACEPTADO."]);
            }
        }

        try {
            DB::beginTransaction();
            $invoice = $this->guardarNuevaFactura($request->all());

            // Usar el servicio para emitir (maneja tanto real como simulación internamente)
            if ($request->boolean('issue') || $request->boolean('simulate')) {
                $this->dteService->issueInvoiceDte($invoice);
            }

            DB::commit();
            return redirect()->route('documents')->with('success', 'Documento creado.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invoice Error: ' . $e->getMessage());
            return back()->withErrors(['dte_error' => 'Error: ' . $e->getMessage()]);
        }
    }

    private function guardarNuevaFactura(array $data): Invoice
    {
        if (empty($data['items'])) throw new \Exception("Mínimo un ítem.");
        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');

        $patientId = $data['patient_id'] ?? null;
        $clientRut = data_get($data, 'client.rut');

        if (!$patientId && $clientRut) {
            $patient = Patient::where('rut', $clientRut)->where('company_id', $currentCompanyId)->first();
            if (!$patient) {
                $fullName = data_get($data, 'client.razonSocial', 'Cliente Gral');
                $parts = explode(' ', $fullName, 2);
                $patient = Patient::create([
                    'company_id' => $currentCompanyId,
                    'rut' => $clientRut,
                    'name' => $parts[0],
                    'last_name' => $parts[1] ?? '.',
                    'status' => 'active',
                ]);
                $patient->branches()->attach($activeBranchId, ['status' => 'active']);
            }
            $patientId = $patient->id;
        }

        if (!$patientId) throw new \Exception("Identidad de receptor no detectada.");

        $invoice = Invoice::create([
            'company_id' => $currentCompanyId,
            'branch_id' => $activeBranchId,
            'user_id' => auth()->id(),
            'patient_id' => $patientId,
            'entity_type' => 'Patient',
            'entity_id' => $patientId,
            'dte_type' => $data['dte_type'],
            'issue_date' => $data['issue_date'],
            // Professionals English Naming
            'net_amount_clp' => 0,
            'exempt_amount_clp' => 0,
            'vat_amount_clp' => 0,
            'total_amount_clp' => 0,
            'dte_status' => 'pending',
            'payment_status' => 'unpaid',
            'global_discount_clp' => $data['global_discount_clp'] ?? 0,
            'observations' => $data['observations'] ?? null,
            'metadata' => [
                'client' => [
                    'rut' => $data['client']['rut'],
                    'razonSocial' => $data['client']['razonSocial'],
                    'giro' => $data['client']['giro'] ?: (in_array($data['dte_type'], [39, 41]) ? 'Particular' : ''),
                    'direccion' => $data['client']['direccion'] ?? '',
                    'comuna' => $data['client']['comuna'] ?? '',
                ],
                'payment_method' => $data['payment_method'] ?? 'Efectivo'
            ]
        ]);

        foreach ($data['items'] as $item) {
            // ... validación de seguridad ...
            if (isset($item['sellable_type']) && $item['sellable_type'] === 'TreatmentSession' && !empty($item['sellable_id'])) {
                $session = \App\Models\TreatmentSession::find($item['sellable_id']);
                if ($session && $session->dte_generated) {
                    throw new \Exception("La sesión #{$session->id} ({$item['description']}) ya tiene un DTE generado.");
                }
            }

            $qty = (float)($item['quantity'] ?? 1);
            $unit = (float)($item['unitPrice'] ?? 0);
            $disc = (float)($item['discount_clp'] ?? 0);
            $gross = ($qty * $unit) * (1 - ($disc / 100)); // Valor base para el servicio/boleta

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'company_id' => $currentCompanyId,
                'branch_id' => $activeBranchId,
                'description' => $item['description'],
                'comment' => $item['comment'] ?? null,
                'quantity' => $qty,
                'unit_price_clp' => $unit,
                'total_gross_clp' => $gross,
                'total_patient_clp' => $gross,
                'discount_percentage' => $disc,
                'is_exento' => $item['is_exempt'] ?? (in_array($data['dte_type'], [34, 41])),
                'sellable_type' => $item['sellable_type'] ?? null,
                'sellable_id' => $item['sellable_id'] ?? null,
            ]);
        }

        // Una vez creados los ítems, invocamos al calculador para setear los totales de la factura
        app(\App\Services\Dte\DteCalculatorService::class)->calculateAndDetermineType($invoice);

        return $invoice;
    }

    public function issueDte(int $invoiceId)
    {
        try {
            $invoice = Invoice::findOrFail($invoiceId);
            $this->authorize('update', $invoice);
            $trackId = $this->dteService->issueInvoiceDte($invoice);
            return response()->json(['success' => true, 'track_id' => $trackId, 'message' => 'Enviado al SII.']);
        } catch (\Exception $e) {
            Log::error("Emit Error #{$invoiceId}: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Fallo: ' . $e->getMessage()], 500);
        }
    }

    public function checkDteStatus(int $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);
        $this->authorize('view', $invoice);
        $dte = $invoice->currentDte;
        if (!$dte || !$dte->track_id) return response()->json(['success' => false, 'message' => 'Sin Track ID.'], 404);

        try {
            $result = $this->dteService->checkDteStatus($dte->track_id, $invoice->company_id);
            $status = data_get($result, 'estado', 'ERROR');
            $map = ['ACEPTADO' => 'accepted', 'RECHAZADO' => 'rejected', 'RECHAZADO_SII' => 'rejected', 'ERROR' => 'error'];
            if ($status && isset($map[$status])) $invoice->update(['dte_status' => $map[$status]]);
            return response()->json(['success' => true, 'estado_sii' => $status, 'message' => "Estado SII: {$status}. " . data_get($result, 'glosa')]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function lookupByFolio($folio)
    {
        $currentCompanyId = session('current_company_id');
        $invoice = Invoice::where('dte_folio', $folio)->where('company_id', $currentCompanyId)->with(['patient', 'items'])->first();
        if (!$invoice) return response()->json(['found' => false], 404);

        return response()->json([
            'found' => true,
            'invoice_id' => $invoice->id,
            'patient_id' => $invoice->patient_id,
            'type_name' => $invoice->type_name,
            'issue_date' => $invoice->issue_date->format('Y-m-d'),
            'amount_total' => $invoice->amount_total_clp,
            'global_discount' => $invoice->global_discount_clp,
            'observations' => $invoice->observations,
            'client' => ['rut' => $invoice->patient->rut, 'razonSocial' => $invoice->patient->full_name, 'giro' => data_get($invoice->metadata, 'client.giro', 'Particular')],
            'items' => $invoice->items->map(fn($i) => ['description' => $i->description, 'comment' => $i->comment, 'quantity' => $i->quantity, 'unitPrice' => $i->unit_price_clp, 'discount_clp' => $i->discount_percentage, 'is_exempt' => (bool)$i->is_exento])->values()
        ]);
    }
}
