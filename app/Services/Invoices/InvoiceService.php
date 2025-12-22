<?php

namespace App\Services\Invoices;

use App\Models\{Invoice, InvoiceItem, TreatmentSession, PatientPlan, CompanySetting, Payment, SessionType};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class InvoiceService
{
  public function processInvoice(Payment $payment, array $data, string $type = Invoice::TYPE_BOLETA): Invoice
  {
    return DB::transaction(function () use ($payment, $data, $type) {

      $invoice = $this->createInvoice($payment, $data);

      return $invoice->load('items');
    });
  }

  /**
   * Crea el registro de pago
   */
  private function createInvoice(Payment $payment, array $data): Invoice
  {
    return DB::transaction(function () use ($payment, $data) {

      $totalNeto = 0;
      $totalIva = 0;
      $totalExento = 0;

      // 1. Primero iteramos los ítems para calcular los totales legales
      foreach ($data['services_to_bill'] as $item) {
        $subtotalItem = ($item['unit_patient'] ?? 0) * ($item['quantity'] ?? 1);

        // Determinamos si el ítem es afecto (por defecto en salud es exento: false)
        $isAfecto = isset($item['is_product']) && $item['is_product'] === true;

        if ($isAfecto && $subtotalItem > 0) {
          // Desglosamos el IVA (Total / 1.19)
          $neto = round($subtotalItem / 1.19);
          $iva = $subtotalItem - $neto;

          $totalNeto += $neto;
          $totalIva += $iva;
        } else {
          // Todo a exento (Prestaciones médicas)
          $totalExento += $subtotalItem;
        }
      }

      $totalDocumento = $totalNeto + $totalIva + $totalExento;

      // 2. Creamos el encabezado con los montos calculados
      $invoice = Invoice::create([
        'uuid'       => (string) \Illuminate\Support\Str::uuid(),
        'company_id' => $payment->company_id,
        'branch_id'  => $payment->branch_id,
        'user_id'    => auth()->id(),
        'patient_id' => $payment->patient_id,
        'payment_id' => $payment->id,
        'entity_type' => 'App\Models\Patient',
        'entity_id'   => $payment->patient_id,

        // Montos Contables Reales
        'amount_neto'   => $totalNeto,
        'amount_iva'    => $totalIva,
        'amount_exento' => $totalExento,
        'amount_total'  => $totalDocumento,

        // Desglose Clínico
        'amount_gross'               => $data['final_shares']['amount_gross'] ?? 0,
        'amount_insurance_primary'   => $data['final_shares']['amount_insurance_primary'] ?? 0,
        'amount_insurance_secondary' => $data['final_shares']['amount_insurance_secondary'] ?? 0,
        'amount_patient'             => $payment->amount_clp,

        'issue_date'     => now(),
        // Lógica de tipo de DTE: Si hay Neto, es Boleta Afecta (39), si no, es Exenta (41)
        'dte_type'       => ($totalNeto > 0) ? 39 : 41,
        'dte_status'     => Invoice::SII_STATUS_PENDING,
        'payment_status' => Invoice::PAYMENT_STATUS_PAID,
      ]);

      // 3. Crear los ítems vinculados (invoice_items)
      foreach ($data['services_to_bill'] as $item) {
        // Calculamos totales por línea para mayor precisión
        $qty = $item['quantity'] ?? 1;
        $uPatient = $item['unit_patient'] ?? 0;
        $uInsurance1 = $item['unit_insurance_primary'] ?? 0;
        $uInsurance2 = $item['unit_insurance_secondary'] ?? 0;
        $uPrice = $item['unit_price'] ?? 0; // Precio arancel base

        $invoice->items()->create([
          'company_id'      => $payment->company_id,
          'branch_id'       => $payment->branch_id,

          // Relaciones Clínicas
          'session_type_id'      => $item['session_type_id'] ?? null,
          'treatment_session_id' => $item['treatment_session_id'] ?? null,
          'agreement_item_id'    => $item['agreement_item_id'] ?? null,

          // Datos del ítem
          'description' => $item['name'] ?? 'Prestación de salud',
          'quantity'    => $qty,

          // Desglose de Precios Unitarios
          'unit_price'               => $uPrice,
          'unit_insurance_primary'   => $uInsurance1,
          'unit_insurance_secondary' => $uInsurance2,
          'unit_patient'             => $uPatient,

          // Totales de la línea
          'total_gross'   => $uPrice * $qty,    // Total arancelario
          'total_patient' => $uPatient * $qty,  // Lo que efectivamente paga el paciente (Base de la boleta)

          // Identificador tributario (Basado en lo que definimos antes)
          'is_exento' => $item['is_exento'] ?? true,
        ]);
      }

      return $invoice;
    });
  }

  /**
   * Simulación de envío a SII mediante proveedor (LibreDTE / etc.)
   * Aquí deberías:
   *  - construir el payload del documento,
   *  - llamar al API del proveedor,
   *  - guardar track_id, número, PDF/XML.
   */
  public function sendToSii(Invoice $invoice): void
  {
    // TODO: integrar proveedor real. Simulación:
    $invoice->sii_status = Invoice::SII_STATUS_ACCEPTED;
    $invoice->document_number = $invoice->id; // (simulado)
    $invoice->sii_track_id = 'TRACK-' . $invoice->id;
    $meta = $invoice->meta ?? [];
    $meta['provider'] = 'SIMULATED';
    $invoice->meta = $meta;
    $invoice->save();
  }

  public function cancelWithCreditNote(Invoice $invoice, string $reason): Invoice
  {
    // TODO: emitir nota de crédito contra $invoice y actualizar estados
    $invoice->status = Invoice::SII_STATUS_REJECTED;
    $meta = $invoice->meta ?? [];
    $meta['cancellation_note'] = $reason;
    $invoice->meta = $meta;
    $invoice->save();

    return $invoice->fresh();
  }
}
