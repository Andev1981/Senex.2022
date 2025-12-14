<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentNowRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Jobs\Dte\EmitDteJob;
use App\Models\Debt;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\TreatmentSession;
use App\Services\InvoiceService;
use App\Services\Payments\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{

   /**
     * Inyectar el service en el constructor
     */
    public function __construct(
        private PaymentService $paymentService,
        private InvoiceService $invoiceService
    ) {}


  public function store(StorePaymentRequest $request)
{
    $data = $request->validated();

    DB::beginTransaction();
    try {
        // 1. PROCESAR EL PAGO (Crítico)
        // Si falla aquí, el catch hará rollback y nada se guardará.
        $payment = $this->paymentService->processPayment($data);

        try {
            // 2. PROCESAR LA FACTURA (Importante pero secundario al pago)
            $invoice = $this->invoiceService->processInvoice($payment, $data);

            // Si llegamos aquí, ambos servicios fueron exitosos
            DB::commit();

            // 3. DESPACHAR EL JOB (Fuera de la transacción por seguridad)
            EmitDteJob::dispatch($invoice->id);

            session()->flash('message', 'Pago registrado y boleta enviada al SII.');
            session()->flash('type', 'success');

        } catch (\Exception $eInvoice) {
            // Si falla la factura, confirmamos el pago de todos modos
            DB::commit(); 
            
            Log::error("Pago #{$payment->id} guardado, pero falló la factura: " . $eInvoice->getMessage());
            
            session()->flash('message', 'Pago registrado, pero hubo un problema al generar la boleta. Favor generarla manualmente.');
            session()->flash('type', 'warning');
        }

        return back();

    } catch (\Exception $ePayment) {
        // Si el pago falla, deshacemos TODO
        DB::rollBack();
        
        Log::critical("Error fatal al procesar pago: " . $ePayment->getMessage());
        
        session()->flash('message', 'No se pudo registrar el pago: ' . $ePayment->getMessage());
        session()->flash('type', 'error');
        return back();
    }
}


  public function chargeNowForSession(StorePaymentRequest $req, PaymentService $svc, TreatmentSession $session)
  {
    /* $this->authorize('update', $session);
    $payment = $svc->chargeNowForSession($session, $req->input('method'));

    return back()->with('ok', "Pago registrado (#{$payment->id})"); */
  }

  public function createWebpay(Request $req, PaymentService $svc, TreatmentSession $session)
  {
    $this->authorize('update', $session);
    /* $result = $svc->createWebpayTransaction(
      $session->patient_id,
      (float)$session->patient_amount,
      ['treatment_session_id' => $session->id]
    ); */

    // redirige a pasarela
   /*  return redirect()->away($result['redirect']); */
  }

  // returnUrl/finish de WebPay
  public function confirmWebpay(Request $req, PaymentService $svc)
  {
    /* $token = $req->get('token_ws') ?? $req->get('TBK_TOKEN');
    $payment = $svc->confirmWebpayTransaction((string)$token);

    return redirect()->route('payments.show', $payment)
      ->with($payment->status === 'completed' ? 'ok' : 'error', 'Pago ' . $payment->status); */
  }

  public function allocateToInvoice(Request $req, PaymentService $svc, Invoice $invoice)
  {
    /* $this->authorize('update', $invoice);
    $paymentId = $req->input('payment_id');
    $amount_clp    = $req->input('amount_clp');

    $payment = \App\Models\Payment::findOrFail($paymentId);
    $svc->allocateToInvoice($payment, $invoice, $amount_clp ? (float)$amount_clp : null);

    return back()->with('ok', 'Pago asignado a factura.'); */
  }

  public function settleDebt(Request $req, PaymentService $svc, Debt $debt)
  {
    /* $this->authorize('update', $debt);
    $paymentId = $req->input('payment_id');
    $amount_clp    = $req->input('amount_clp');

    $payment = \App\Models\Payment::findOrFail($paymentId);
    $svc->settleDebtWithPayment($debt, $payment, $amount_clp ? (float)$amount_clp : null);

    return back()->with('ok', 'Deuda actualizada.'); */
  }

 
}
