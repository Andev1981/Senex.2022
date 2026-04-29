<?php

namespace App\Services\Invoices;

use App\Models\Invoice;
use App\Models\Payment;
use App\Enums\DteStatusEnum;
use App\Enums\FinanceStatusEnum;
use App\Services\Dte\DteService;
use App\Jobs\Dte\EmitDteJob;
use App\Jobs\Dte\CheckDteStatusJob;
use App\Models\CompanyDirectory;
use App\Models\Item;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvoiceService
{
  public function __construct(
    protected DteService $dteService
  ) {}

  public function processInvoice(Payment $payment, array $data, bool $isPos = false): Invoice
  {
    $invoice = $this->createLocalInvoice($payment, $data, $isPos);

    try {
      $trackId = $this->dteService->issueInvoiceDte($invoice);
      $invoice->refresh();

      if ($trackId) {
        CheckDteStatusJob::dispatch($invoice->id)->delay(now()->addMinutes(5));
      }

    } catch (\Throwable $e) {
      Log::warning("Fallo emisión síncrona DTE Factura ID {$invoice->id}. Delegando a Job: " . $e->getMessage());
      EmitDteJob::dispatch($invoice->id)->delay(now()->addSeconds(10));

      $invoice->update([
        'dte_status' => DteStatusEnum::RETRY,
        'dte_notes'  => 'Fallo intento síncrono: ' . substr($e->getMessage(), 0, 200)
      ]);
    }

    return $invoice->load('items');
  }

  protected function createLocalInvoice(Payment $payment, array $data, bool $isPos = false): Invoice
  {
    return DB::transaction(function () use ($payment, $data, $isPos) {
      $totalNeto = 0;
      $totalIva = 0;
      $totalExento = 0;
      // 1. Cálculos Contables de los Ítems
      foreach ($data['services_to_bill'] as $item) {
        $qty = (int)($item['quantity'] ?? 1);
        if ($qty < 1) $qty = 1;

        $uPrice = (int)($item['unit_price_clp'] ?? 0);
        $subtotalItem = $uPrice * $qty;

        $isExento = isset($item['is_exempt']) ? (bool)$item['is_exempt'] : true;

        if (!$isExento && $subtotalItem > 0) {
          $neto = (int)round($subtotalItem / 1.19);
          $iva = $subtotalItem - $neto;
          $totalNeto += $neto;
          $totalIva += $iva;
        } else {
          $totalExento += $subtotalItem;
        }
      }

      // Total Legal SII (Sincronizado con el pago real)
      $totalRealPagado = (int)$payment->amount_clp;
      $descuentoGlobal = (int)($data['final_shares']['discount_clp'] ?? 0);

      // Si el total calculado de ítems es mayor al pagado, el diferencial es el descuento
      $totalCalculadoItems = $totalNeto + $totalIva + $totalExento;

      if ($totalCalculadoItems > $totalRealPagado) {
          // Ajustamos el monto exento o neto proporcionalmente para que el DTE cuadre con el pago
          if ($totalExento > 0) {
              $totalExento = max(0, $totalRealPagado - ($totalNeto + $totalIva));
          } else {
              $totalNeto = (int)round($totalRealPagado / 1.19);
              $totalIva = $totalRealPagado - $totalNeto;
          }
      }

      $totalDocumento = $totalNeto + $totalIva + $totalExento;

      // 2. Determinación de Receptor (Persona vs Empresa)
      $rawPatientId = $data['patient_id'] ?? ''; 
      $entityType = 'Patient';
      $entityId = $payment->patient_id;
      $receptorData = [
          'rut' => '66666666-6',
          'name' => 'CONSUMIDOR FINAL',
          'giro' => 'PARTICULAR'
      ];

      if (str_starts_with($rawPatientId, 'company_')) {
          $id = (int) str_replace('company_', '', $rawPatientId);
          $corporate = CompanyDirectory::find($id);
          if ($corporate) {
              $entityType = 'CorporateClient';
              $entityId = $corporate->id;
              $receptorData = [
                  'rut' => $corporate->rut,
                  'name' => $corporate->business_name,
                  'giro' => $corporate->giro,
                  'email' => $corporate->email,
                  'phone' => $corporate->phone
              ];
          }
      } else {
          $patient = $payment->patient;
          if ($patient) {
              $receptorData = [
                  'rut' => $patient->rut,
                  'name' => $patient->full_name,
                  'giro' => 'PARTICULAR',
                  'email' => $patient->email,
                  'phone' => $patient->phone
              ];
          }
      }

      // 3. Crear Encabezado de Factura
      $rutNumerico = (int) str_replace(['.', '-'], '', $receptorData['rut']);

      $invoice = new Invoice();
      $invoice->company_id = $payment->company_id;
      $invoice->branch_id  = $payment->branch_id ?? session('active_branch_id');
      $invoice->user_id    = auth()->id() ?? $payment->user_id; 
      $invoice->patient_id = ($entityType === 'Patient') ? $entityId : null;
      $invoice->entity_type = $entityType;
      $invoice->entity_id  = $entityId;

      $invoice->metadata = [
          'client' => $receptorData,
          'payment_method' => $payment->payment_method
      ];

      // Montos iniciales (se refinarán con el calculador abajo)
      $invoice->net_amount_clp    = (int)$totalNeto;
      $invoice->vat_amount_clp    = (int)$totalIva;
      $invoice->exempt_amount_clp = (int)$totalExento;
      $invoice->total_amount_clp  = (int)$totalDocumento;

      $invoice->amount_gross_clp               = (int)($data['final_shares']['amount_gross_clp'] ?? $totalDocumento);
      $invoice->amount_insurance_primary_clp   = (int)($data['final_shares']['amount_insurance_primary_clp'] ?? 0);
      $invoice->amount_insurance_secondary_clp = (int)($data['final_shares']['amount_insurance_secondary_clp'] ?? 0);
      $invoice->amount_patient_clp             = (int)$payment->amount_clp;

      $invoice->issue_date     = now();
      // En Caja/POS siempre se emite Boleta (luego el calculador ajusta a 41 si es exento)
      $invoice->dte_type       = 39; 
      $invoice->dte_status     = DteStatusEnum::GENERATED; 
      $invoice->payment_status = FinanceStatusEnum::PAID;
      $invoice->global_discount_clp = (int)$descuentoGlobal;

      $invoice->save();
      
      // ... vincular pago y crear ítems ...
      // Vincular Pago
      \App\Models\PaymentAllocation::create([
          'payment_id' => $payment->id,
          'invoice_id' => $invoice->id,
          'amount_clp' => $payment->amount_clp,
      ]);

      // 4. Crear los ítems vinculados
      foreach ($data['services_to_bill'] as $item) {
        $qty = max(1, (int)($item['quantity'] ?? 1)); // Aseguramos cantidad mínima 1
        $uPrice = (int)($item['unit_price_clp'] ?? 0);
        $uPatient = (int)($item['unit_patient_clp'] ?? $uPrice);

        // Captura del ID real (Ahora siempre es un Item si no es Plan)
        $sellableId = $item['item_id'] ?? $item['sellable_id'] ?? $item['id'] ?? null;
        $sellableType = $item['sellable_type'] ?? 'Item';
        $treatmentSessionId = $item['treatment_session_id'] ?? null;

        // Si es POS, es una empresa clínica y es un servicio sin sesión previa: CREAR SESIÓN COMPLETADA
        if ($isPos && $invoice->patient_id && $sellableType === 'Item' && !$treatmentSessionId) {
            $itemModel = Item::find($sellableId);
            if ($itemModel && $itemModel->isService()) {
                try {
                    // Creamos la sesión usando el service para asegurar la lógica de tratamientos
                    $sessionData = [
                        'company_id' => $invoice->company_id,
                        'branch_id'  => $invoice->branch_id,
                        'patient_id' => $invoice->patient_id,
                        'doctor_id'  => $item['doctor_id'] ?? auth()->id(),
                        'item_id'    => $itemModel->id,
                        'date'       => now()->format('Y-m-d'),
                        'time'       => now()->format('H:i:s'),
                        'status'     => \App\Enums\AppointmentStatusEnum::COMPLETED,
                        'patient_amount_clp' => $uPatient,
                        'is_exento'  => (bool)$itemModel->is_exempt,
                        'dte_generated' => true, // La estamos generando ahora mismo
                    ];
                    
                    $newSession = app(\App\Services\Treatments\TreatmentSessionService::class)->createSession($sessionData);
                    $treatmentSessionId = $newSession->id;
                } catch (\Exception $e) {
                    Log::error("Error auto-creando sesión en POS: " . $e->getMessage());
                }
            }
        }

        $invoice->items()->create([
          'company_id'      => $payment->company_id,
          'branch_id'       => $invoice->branch_id,
          'treatment_session_id' => $treatmentSessionId,
          'sellable_type'   => $sellableType,
          'sellable_id'     => $sellableId,
          'description'     => $item['name'] ?? 'Ítem de venta',
          'quantity'        => $qty, 
          'unit_price_clp'               => $uPrice,
          'unit_patient_clp'             => $uPatient,
          'unit_insurance_primary_clp'   => (int)($item['unit_insurance_primary_clp'] ?? 0),
          'unit_insurance_secondary_clp' => (int)($item['unit_insurance_secondary_clp'] ?? 0),
          'total_gross_clp'   => $uPrice * $qty, 
          'total_patient_clp' => $uPatient * $qty,
          'is_exento'         => isset($item['is_exempt']) ? (bool)$item['is_exempt'] : true,
        ]);

        // Si es una sesión previa, marcar como DTE generado
        if (!empty($item['treatment_session_id'])) {
          \App\Models\TreatmentSession::where('id', $item['treatment_session_id'])->update(['dte_generated' => true]);
        }

        // Descuento de Stock si es Producto
        if ($sellableType === 'Item' && $sellableId) {
          $itemModel = Item::with('productDetail')->find($sellableId);
          if ($itemModel && $itemModel->isProduct() && $itemModel->productDetail && $itemModel->productDetail->manage_stock) {
            $itemModel->productDetail->decrement('stock', $qty);
          }
        }
      }

      // Sincronizar totales y corregir tipo (Afecto/Exento) según ítems reales
      app(\App\Services\Dte\DteCalculatorService::class)->calculateAndDetermineType($invoice);

      return $invoice;
    });
  }

  public function issueInvoiceForPlanPurchase(Payment $payment, Plan $plan, int $patientAmount): Invoice
  {
      $invoiceData = [
          'services_to_bill' => [
              [
                  'name' => $plan->name,
                  'quantity' => 1,
                  'unit_price_clp' => $plan->price,
                  'unit_patient_clp' => $patientAmount,
                  'is_exempt' => true,
                  'sellable_type' => 'Plan',
                  'sellable_id' => $plan->id,
              ]
          ],
          'final_shares' => [
              'amount_gross_clp' => $plan->price,
              'amount_insurance_primary_clp' => 0,
              'amount_insurance_secondary_clp' => 0,
              'discount_clp' => 0,
          ],
      ];
      return $this->processInvoice($payment, $invoiceData);
  }
}
