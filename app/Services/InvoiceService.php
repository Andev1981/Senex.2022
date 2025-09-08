<?php

namespace App\Services;

use App\Models\{Invoice, InvoiceItem, TreatmentSession, PatientPlan, CompanySetting, SessionType};
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvoiceService
{
  public function issueForSession(TreatmentSession $session, string $type = Invoice::TYPE_BOLETA): Invoice
  {
    return DB::transaction(function () use ($session, $type) {


      $company = CompanySetting::query()->first();
      if (!$company) throw new RuntimeException('Faltan datos tributarios de la empresa.');

      // 1) Crear invoice issued (o draft si prefieres)
      $inv = Invoice::query()->create([
        'patient_id'           => $session->patient_id,
        'treatment_session_id' => $session->id,
        'patient_plan_id'      => null,
        'type'                 => $type,
        'document_number'      => null, // se setea al aceptar/emitir
        'issue_date'           => now()->toDateString(),
        'subtotal'             => 0,
        'tax_amount'           => 0,
        'total_amount'         => 0,
        'sii_status'           => Invoice::SII_PENDING,
        'sii_track_id'         => null,
        'pdf_path'             => null,
        'xml_path'             => null,
        'status'               => Invoice::STATUS_ISSUED,
        'meta'                 => [],
      ]);

      // 2) Crear item
      $desc = optional($session->sessionType)->name ?? 'Atención Kinesiología';
      $price = (float) ($session->patient_amount ?? 0);

      InvoiceItem::query()->create([
        'invoice_id'     => $inv->id,
        'description'    => $desc,
        'session_type_id' => $session->session_type_id,
        'quantity'       => 1,
        'unit_price'     => $price,
        'discount_amount' => 0,
        'line_total'     => $price,
        'tax_exempt'     => true, // ajustar según giro/servicio
        'sii_item_code'  => null,
      ]);

      // 3) Recalcular totales (exento por defecto)
      $inv->recalcTotalsFromItems(
        taxRate: (int)($company->tax_rate ?? 0),
        taxExempt: true
      );

      // 4) Enviar a SII vía proveedor (simulado aquí)
      $this->sendToSii($inv);

      return $inv->fresh('items');
    });
  }

  public function issueForPlan(PatientPlan $pp, string $type = Invoice::TYPE_FACTURA): Invoice
  {
    return DB::transaction(function () use ($pp, $type) {


      $company = CompanySetting::query()->first();
      if (!$company) throw new RuntimeException('Faltan datos tributarios de la empresa.');

      $plan = $pp->plan;
      $price = (float)($plan->price ?? 0);

      $inv = Invoice::query()->create([
        'patient_id'           => $pp->patient_id,
        'treatment_session_id' => null,
        'patient_plan_id'      => $pp->id,
        'type'                 => $type,
        'document_number'      => null,
        'issue_date'           => now()->toDateString(),
        'subtotal'             => 0,
        'tax_amount'           => 0,
        'total_amount'         => 0,
        'sii_status'           => Invoice::SII_PENDING,
        'sii_track_id'         => null,
        'pdf_path'             => null,
        'xml_path'             => null,
        'status'               => Invoice::STATUS_ISSUED,
        'meta'                 => [],
      ]);

      InvoiceItem::query()->create([

        'invoice_id'     => $inv->id,
        'description'    => 'Compra de plan: ' . ($plan->name ?? 'N/D'),
        'session_type_id' => null,
        'quantity'       => 1,
        'unit_price'     => $price,
        'discount_amount' => 0,
        'line_total'     => $price,
        'tax_exempt'     => true, // ajustar si facturas con IVA
        'sii_item_code'  => null,
      ]);

      $inv->recalcTotalsFromItems(
        taxRate: (int)($company->tax_rate ?? 0),
        taxExempt: true
      );

      $this->sendToSii($inv);

      return $inv->fresh('items');
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
    $invoice->sii_status = Invoice::SII_ACCEPTED;
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
    $invoice->status = Invoice::STATUS_CANCELLED;
    $meta = $invoice->meta ?? [];
    $meta['cancel_reason'] = $reason;
    $invoice->meta = $meta;
    $invoice->save();

    return $invoice->fresh();
  }
}
