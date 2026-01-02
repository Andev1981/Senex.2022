<?php

namespace App\Services\Invoices;

use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Dte\DteService;
use App\Jobs\Dte\EmitDteJob; // Importamos el Job para el fallback
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvoiceService
{
  // Inyectamos tu DteService, que es el que orquesta toda la lógica compleja (Folios, Mapper, Provider)
  public function __construct(
    protected DteService $dteService
  ) {}

  /**
   * Proceso Híbrido: Crea el registro y trata de emitir DTE.
   * Si falla el DTE, no rompe el flujo, sino que encola el Job.
   */
  public function processInvoice(Payment $payment, array $data): Invoice
  {
    // 1. CREACIÓN LOCAL (Transacción DB)
    // Separamos la creación de la emisión. Primero aseguramos el registro en BD.
    $invoice = $this->createLocalInvoice($payment, $data);

    // 2. INTENTO DE EMISIÓN SÍNCRONA (Best Effort)
    try {
      // Llamamos a tu DteService que ya maneja folios, payload y firma.
      $trackId = $this->dteService->issueInvoiceDte($invoice);

      // Si llegamos acá, ¡Éxito inmediato!
      $invoice->refresh(); // Recargamos para tener el folio y status actualizados

    } catch (\Throwable $e) {
      // 3. FALLBACK: SI FALLA EL DTE (SII caído, Timeout, etc.)
      // No lanzamos la excepción para no romper la venta en el POS.
      Log::warning("Fallo emisión síncrona DTE Factura ID {$invoice->id}. Delegando a Job: " . $e->getMessage());

      // Despachamos tu Job existente para que reintente en background
      // Usamos delay para dar tiempo a que se estabilice la conexión
      EmitDteJob::dispatch($invoice->id)->delay(now()->addSeconds(10));

      // Opcional: Marcar estado interno indicando problema
      $invoice->update([
        'dte_status' => 'PENDING_RETRY',
        'dte_notes'  => 'Fallo intento síncrono: ' . substr($e->getMessage(), 0, 200)
      ]);
    }

    return $invoice->load('items');
  }

  /**
   * Crea SOLO el registro en base de datos (Lógica contable pura)
   */
  protected function createLocalInvoice(Payment $payment, array $data): Invoice
  {
    return DB::transaction(function () use ($payment, $data) {
      $totalNeto = 0;
      $totalIva = 0;
      $totalExento = 0;

      // 1. Cálculos Contables
      foreach ($data['services_to_bill'] as $item) {
        $subtotalItem = ($item['unit_patient_clp'] ?? 0) * ($item['quantity'] ?? 1);

        // Lógica de Afecto/Exento
        $isAfecto = isset($item['is_product']) && $item['is_product'] === true;

        if ($isAfecto && $subtotalItem > 0) {
          $neto = round($subtotalItem / 1.19);
          $iva = $subtotalItem - $neto;
          $totalNeto += $neto;
          $totalIva += $iva;
        } else {
          $totalExento += $subtotalItem;
        }
      }

      $totalDocumento = $totalNeto + $totalIva + $totalExento;

      // 2. Crear Encabezado
      $invoice = Invoice::create([
        'uuid'       => (string) Str::uuid(),
        'company_id' => $payment->company_id,
        'branch_id'  => $payment->branch_id,
        'user_id'    => auth()->id(), // Ojo con esto si es Job, auth() puede ser null
        'patient_id' => $payment->patient_id,
        'payment_id' => $payment->id,
        'entity_type' => 'App\Models\Patient',
        'entity_id'  => $payment->patient_id,

        // Montos
        'amount_neto_clp'   => $totalNeto,
        'amount_iva_clp'    => $totalIva,
        'amount_exento_clp' => $totalExento,
        'amount_total_clp'  => $totalDocumento,

        // Desglose Clínico
        'amount_gross_clp'               => $data['final_shares']['amount_gross_clp'] ?? 0,
        'amount_insurance_primary_clp'   => $data['final_shares']['amount_insurance_primary_clp'] ?? 0,
        'amount_insurance_secondary_clp' => $data['final_shares']['amount_insurance_secondary_clp'] ?? 0,
        'amount_patient_clp'             => $payment->amount_clp,

        'issue_date'     => now(),
        'dte_type'       => ($totalNeto > 0) ? 39 : 41, // 39: Boleta Afecta, 41: Exenta
        'dte_status'     => 'CREATED', // Estado inicial interno
        'payment_status' => 'PAID',
      ]);

      // 3. Crear los ítems vinculados (invoice_items)
      foreach ($data['services_to_bill'] as $item) {

        // A. Preparar variables básicas
        $qty = $item['quantity'] ?? 1;
        $uPrice = $item['unit_price_clp'] ?? 0;
        $uPatient = $item['unit_patient_clp'] ?? 0;

        // B. Lógica Polimórfica (El corazón del cambio)
        // El frontend debe enviar 'type': 'product' o 'session' (o inferirlo por is_product)
        $isProduct = isset($item['type']) && $item['type'] === 'product';

        // Definimos el MorphMap (debe coincidir con AppServiceProvider)
        $sellableType = $isProduct ? 'Product' : 'SessionType';

        // Si es sesión, usamos el session_type_id; si es producto, el id del producto
        $sellableId = $isProduct ? ($item['id'] ?? null) : ($item['session_type_id'] ?? null);

        // C. Crear el registro
        $invoiceItem = $invoice->items()->create([
          'company_id'      => $payment->company_id,
          'branch_id'       => $payment->branch_id,

          // --- CAMPOS POLIMÓRFICOS (NUEVO) ---
          'sellable_type'   => $sellableType,
          'sellable_id'     => $sellableId,

          // --- CAMPOS MÉDICOS LEGADOS (SOLO SI ES SESIÓN) ---
          'treatment_session_id' => !$isProduct ? ($item['treatment_session_id'] ?? null) : null,
          'agreement_rule_id'    => !$isProduct ? ($item['agreement_rule_id'] ?? null) : null,

          // --- DATOS FINANCIEROS ---
          'description'     => $item['name'] ?? 'Ítem de venta',
          'quantity'        => $qty,

          'unit_price_clp'               => $uPrice,
          'unit_insurance_primary_clp'   => $item['unit_insurance_primary_clp'] ?? 0,
          'unit_insurance_secondary_clp' => $item['unit_insurance_secondary_clp'] ?? 0,
          'unit_patient_clp'             => $uPatient,

          'total_gross_clp'   => $uPrice * $qty,
          'total_patient_clp' => $uPatient * $qty,

          // Si es producto, usa su flag 'is_exempt'. Si es sesión, por defecto es exento (true)
          'is_exento'         => $isProduct ? ($item['is_exempt'] ?? false) : true,
        ]);

        // D. Descuento de Stock (Solo si es Producto)
        if ($isProduct && $sellableId) {
          // Buscamos el producto (usando el modelo Product importado)
          $productModel = Product::find($sellableId);

          // Si existe y maneja stock, descontamos
          if ($productModel && $productModel->manage_stock) {
            $productModel->decrement('stock', $qty);
          }
        }
      }

      return $invoice;
    });
  }
}
