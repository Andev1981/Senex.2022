<?php

namespace App\Services;

use App\Models\{Invoice, InvoiceItem, TreatmentSession, PatientPlan, CompanySetting, Payment, SessionType};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class InvoiceService
{
  public function processInvoice(Payment $payment,array $data, string $type = Invoice::TYPE_BOLETA): Invoice
  {
    return DB::transaction(function () use ($payment, $data, $type) 
    {

      /* $company = CompanySetting::query()->first();
      if (!$company) throw new RuntimeException('Faltan datos tributarios de la empresa.'); */
      
      $invoice = $this->createInvoice($data, $payment);

      if (!empty($data['session_ids'])) {
                $sessionsIds = TreatmentSession::with('debt')->whereIn('id', $data['session_ids'])->get();
                $this->createItemsInvoice($invoice, $sessionsIds);
            }
      
      return $invoice->load('items');
    });
  }

   /**
     * Crea el registro de pago
     */
    private function createInvoice(array $data, Payment $payment): Invoice
    {
        return Invoice::create([
            'company_id' => $data["company_id"],
            'issue_date' =>  Carbon::now()->format('d-m-Y'),
            'payment_id' => $payment->id,
            'status' => 'pending', // Aún no enviado al SII
            'patient_id' => $data['patient_id'],
        ]);
    }

       /**
         * Asigna un pago a múltiples sesiones
         */
        public function createItemsInvoice(Invoice $invoice,$sessionIds): void
        {
            
                foreach ($sessionIds as $sessionId) {
                  $sessionDate = Carbon::parse($sessionId->date)->format('d-m-Y');
                  InvoiceItem::create([
                        'company_id' => $invoice->company_id,
                        'invoice_id' => $invoice->id,
                        'treatment_session_id' => $sessionId->id,
                        'treatment_id' => $sessionId->treatment_id,
                        'description' => 'Sesión de Terapia (' . $sessionDate . ')',
                        'quantity' => 1, // Siempre 1
                        'unit_price_clp' => $sessionId->patient_amount,
                        'total_clp' => $sessionId->patient_amount,
                    ]);
                
                Log::info('Invoices Items creadas: ', [
                    'invoice_id' => $invoice->id,
                    'session_ids' => $sessionIds,
                ]);
              }
          
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
    $meta['cancellation_note'] = $reason;
    $invoice->meta = $meta;
    $invoice->save();

    return $invoice->fresh();
  }
}
