<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Commune;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Product;
use App\Models\SessionType;
use App\Services\Dte\DteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');

        $branches = Branch::where('company_id', $currentCompanyId)->orderBy('name')->get();
        $patients = Patient::when($activeBranchId, function ($query) use ($activeBranchId) {
            $query->whereHas('branches', function ($q) use ($activeBranchId) {
                $q->where('branches.id', $activeBranchId);
            });
        })->with(['address.commune.province.region', 'insurances']) // Cargar relaciones
          ->get()
          ->map(function($p) {
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

        $invoices = Invoice::with('patient', 'items')->where('branch_id', $activeBranchId)->orderByDesc('created_at')->get();
        
        // Cargar comunas con su región
        $communes = Commune::with('province.region')
            ->orderBy('name')
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'region_name' => $c->province?->region?->name ?? 'Sin Región'
                ];
            });

        // Cargar Productos y Servicios (Sellables)
        $products = Product::where('is_active', true)
            ->where('company_id', $currentCompanyId)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'unique_id' => 'prod_' . $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'type' => 'Producto',
                    'is_exempt' => $p->is_exempt ?? false,
                ];
            });

        $services = SessionType::where('is_active', true)
            ->where('company_id', $currentCompanyId)
            ->get()
            ->map(function($s) {
                return [
                    'id' => $s->id,
                    'unique_id' => 'serv_' . $s->id,
                    'name' => $s->name,
                    'price' => $s->base_price_clp,
                    'type' => 'Servicio',
                    'is_exempt' => true, // Por defecto servicios kinesiológicos suelen ser exentos (revisar regla de negocio)
                ];
            });
            
        $sellables = $products->concat($services);

        return Inertia::render('Documents/IndexDocuments', [
            'branches' => $branches,
            'patients' => $patients, 
            'doctors'  => $doctors,
            'invoices' => $invoices,
            'communes' => $communes,
            'sellables' => $sellables,
        ]);
    }

    public function store(Request $request)
    {
        // 0. Validaciones previas de negocio
        if (in_array($request->dte_type, [61, 56])) { // NC o ND
            $refFolio = $request->reference_doc;
            if (!$refFolio) {
                return back()->withErrors(['reference_doc' => 'Debe indicar el folio del documento referenciado.']);
            }

            // Buscar la factura original en NUESTRA base de datos
            $originalInvoice = Invoice::where('dte_folio', $refFolio)
                ->where('company_id', session('current_company_id'))
                ->whereIn('dte_type', [33, 34, 39, 41]) // Documentos válidos para anular
                ->first();

            if (!$originalInvoice) {
                 return back()->withErrors(['reference_doc' => "No se encontró un documento emitido con el folio {$refFolio} en el sistema."]);
            }

            // Validar estado ante el SII
            // Permitimos anular si está ACEPTADO. 
            // Si es 'SIMULATED' o 'ENVIADO' podríamos bloquearlo según rigurosidad.
            if ($originalInvoice->dte_status !== 'ACEPTADO' && !$request->boolean('simulate')) {
                 return back()->withErrors(['reference_doc' => "El documento folio {$refFolio} no está en estado ACEPTADO por el SII (Estado actual: {$originalInvoice->dte_status}). No se puede generar Nota de Crédito/Débito."]);
            }
        }

        // 1. Persistencia: Crear la factura interna (Invoice)
        try {
            DB::beginTransaction();
            $invoice = $this->guardarNuevaFactura($request->all());
            
            // 2. Delegación: Llamar al servicio de negocio para procesar el DTE
            // El DteService se encargará de buscar la config, llamar a LibreDteLocalProvider::issue(), etc.
            
            if ($request->boolean('simulate')) {
                 // SIMULACIÓN: Crear registro DTE ficticio
                 $folioSimulado = rand(1000, 9999);
                 
                 // Crear el registro DTE para que checkDteStatus tenga qué consultar
                 \App\Models\Dte::create([
                     'company_id' => $invoice->company_id,
                     'branch_id' => $invoice->branch_id,
                     'origin_type' => get_class($invoice),
                     'origin_id' => $invoice->id,
                     'type' => $invoice->dte_type,
                     'folio' => $folioSimulado,
                     'rut_emisor' => '76000000-1', // Dummy
                     'rut_receptor' => $invoice->metadata['client']['rut'] ?? '1-9',
                     'total_monto_clp' => $invoice->amount_total_clp,
                     'estado_sii' => 'ENVIADO',
                     'track_id' => time(), // Debe ser entero (bigint)
                     'xml_data' => '<xml>Dummy Simulation</xml>'
                 ]);

                 $invoice->update([
                     'dte_status' => Invoice::SII_STATUS_SENT,
                     'dte_folio' => $folioSimulado
                 ]);
            } else {
                 // PROD: Llamada real
                 // $trackId = $this->dteService->issueInvoiceDte($invoice); 
            }
            
            DB::commit();

            // 3. Respuesta: Devolver una respuesta exitosa.
            // return inertia()->location(route('invoices.show', $invoice->id));
             return redirect()->route('documents')->with('success', 'Documento creado correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating invoice: ' . $e->getMessage());
            return back()->withErrors(['dte_error' => 'Error al crear documento: ' . $e->getMessage()]);
        }
    }

    /**
     * Crea la factura y sus items en la base de datos.
     */
    private function guardarNuevaFactura(array $data): Invoice
    {
        // 1. Validaciones básicas
        if (empty($data['items']) || !is_array($data['items'])) {
            throw new \Exception("El documento debe tener al menos un ítem.");
        }

        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');
        $userId = auth()->id();

        // 2. Obtener o Crear Paciente (Mandatorio por schema)
        $patientId = $data['patient_id'] ?? null;
        $clientRut = $data['client']['rut'] ?? null;

        if (!$patientId && $clientRut) {
            // Buscar por RUT
            $patient = Patient::where('rut', $clientRut)->where('company_id', $currentCompanyId)->first();
            
            if (!$patient) {
                // Crear Nuevo Paciente (Cliente Genérico)
                $fullName = $data['client']['razonSocial'] ?? 'Cliente General';
                // Intento básico de separar nombre y apellido
                $parts = explode(' ', $fullName, 2);
                $name = $parts[0];
                $lastName = $parts[1] ?? '.'; // Apellido dummy si no hay

                $patient = Patient::create([
                    'company_id' => $currentCompanyId,
                    'rut' => $clientRut,
                    'name' => $name,
                    'last_name' => $lastName,
                    'email' => null, // Opcional
                    'status' => 'active', // O 'prospect'
                ]);

                // Asignar a la sucursal actual
                $patient->branches()->attach($activeBranchId, ['status' => 'active']);
            }
            $patientId = $patient->id;
        }

        if (!$patientId) {
             throw new \Exception("No se pudo identificar ni crear al paciente/cliente.");
        }


        // 3. Calcular Totales
        $subtotal = 0;
        $totalIva = 0;
        $isExento = in_array($data['dte_type'], [34, 41]); // Factura Exenta o Boleta Exenta

        foreach ($data['items'] as $item) {
            $qty = (float) ($item['quantity'] ?? 0);
            $price = (float) ($item['unitPrice'] ?? 0);
            $discount = (float) ($item['discount_clp'] ?? 0);
            
            $lineTotal = ($qty * $price); 
            $discountAmount = $lineTotal * ($discount / 100);
            $lineTotal -= $discountAmount;

            $subtotal += $lineTotal;
        }

        // Aplicar descuento global
        $globalDiscount = (float) ($data['global_discount'] ?? 0);
        $subtotal = max(0, $subtotal - $globalDiscount);

        // Si es afecto, calculamos IVA
        if (!$isExento) {
            $totalIva = round($subtotal * 0.19);
        }
        
        $total = $subtotal + $totalIva;

        // 4. Crear Invoice
        $invoice = Invoice::create([
            'company_id' => $currentCompanyId,
            'branch_id' => $activeBranchId,
            'user_id' => $userId,
            'patient_id' => $patientId,
            'entity_type' => Patient::class, // Polimorfismo
            'entity_id' => $patientId,
            'dte_type' => $data['dte_type'],
            'issue_date' => $data['issue_date'],
            'amount_neto_clp' => $isExento ? 0 : $subtotal,
            'amount_exento_clp' => $isExento ? $subtotal : 0,
            'amount_iva_clp' => $totalIva,
            'amount_total_clp' => $total,
            'dte_status' => Invoice::SII_STATUS_PENDING,
            'payment_status' => Invoice::PAYMENT_STATUS_UNPAID,
            'transaction_number' => $data['transaction_number'] ?? null,
            'transaction_date' => $data['transaction_date'] ?? null,
            'global_discount_clp' => $globalDiscount,
            'metadata' => [
                'client' => $data['client'] ?? [],
                'observations' => $data['observations'] ?? '',
                'payment_method' => $data['payment_method'] ?? 'Efectivo',
            ]
        ]);

        // 5. Crear Items
        foreach ($data['items'] as $item) {
             $qty = (float) ($item['quantity'] ?? 0);
             $price = (float) ($item['unitPrice'] ?? 0);
             $discount = (float) ($item['discount_clp'] ?? 0);
             
             $lineTotal = ($qty * $price);
             $discountAmount = $lineTotal * ($discount / 100);
             $finalLineTotal = $lineTotal - $discountAmount;

             InvoiceItem::create([
                 'invoice_id' => $invoice->id,
                 'company_id' => $currentCompanyId,
                 'branch_id' => $activeBranchId,
                 'description' => $item['description'] . ($item['comment'] ? " ({$item['comment']})" : ""),
                 'quantity' => $qty,
                 'unit_price_clp' => $price,
                 'total_gross_clp' => $finalLineTotal,
                 'total_patient_clp' => $finalLineTotal, // Asumimos pago total por paciente en flujo manual
                 'is_exento' => $isExento,
                 'sellable_type' => $item['sellable_type'] ?? null, // Ahora es nullable
                 'sellable_id' => $item['sellable_id'] ?? null,     // Ahora es nullable
             ]);
        }

        return $invoice;
    }

    // -----------------------------------------------------------------

    /**
     * Consulta el estado de un DTE enviado previamente al SII.
     */
    public function checkDteStatus(int $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);
        $dte = $invoice->currentDte();

        if (!$dte || !$dte->track_id) {
            return response()->json(['message' => 'La factura no tiene un Track ID de envío registrado.'], 404);
        }

        try {
            $status = $this->dteService->checkDteStatus($dte->track_id, $invoice->company_id);

            // Opcional: actualizar el estado si es terminal
            if (in_array($status['estado'], ['ACEPTADO', 'RECHAZADO'])) {
                $invoice->update(['dte_status' => $status['estado']]);
            }

            return response()->json([
                'track_id' => $dte->track_id,
                'estado_sii' => $status['estado'],
                'glosa_sii' => $status['glosa'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al consultar estado: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Busca un documento por folio para referenciarlo (NC/ND).
     */
    public function lookupByFolio($folio)
    {
        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');

        $invoice = Invoice::where('dte_folio', $folio)
            ->where('company_id', $currentCompanyId)
            ->with(['patient.address.commune.province.region', 'patient.insurances', 'items'])
            ->first();

        if (!$invoice) {
            return response()->json(['found' => false], 404);
        }

        $patient = $invoice->patient;
        
        // Estructura compatible con el state 'client' del frontend
        $clientData = [
            'rut' => $patient->rut,
            'razonSocial' => $patient->full_name,
            'giro' => "Particular", // O recuperar del invoice metadata si existiera
            'direccion' => $patient->address ? "{$patient->address->street} {$patient->address->number}" : '',
            'comuna' => $patient->address?->commune?->name ?? '',
            'ciudad' => $patient->address?->commune?->province?->region?->name ?? 'Santiago',
            'insurance_name' => $patient->insurances->first()?->name ?? 'Particular',
        ];

        // Mapear items para el frontend
        $items = $invoice->items->map(function($item) {
            return [
                'nombre' => $item->description,
                'cantidad' => $item->quantity,
                'precio' => $item->unit_price_clp,
            ];
        });

        return response()->json([
            'found' => true,
            'invoice_id' => $invoice->id,
            'patient_id' => $patient->id,
            'type_name' => $invoice->type_name,
            'issue_date' => $invoice->issue_date->format('Y-m-d'),
            'amount_total' => $invoice->amount_total_clp,
            'client' => $clientData,
            'items' => $items,
        ]);
    }
}
