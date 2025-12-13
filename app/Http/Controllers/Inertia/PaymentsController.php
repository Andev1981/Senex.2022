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
        private PaymentService $paymentService
    ) {}


     public function store(StorePaymentRequest $request){
    
    $data = $request->validated();

     DB::beginTransaction();
     try {

          /* dd("Antes de enviar: ",$data); */

          $payment = $this->paymentService->processPayment($data);


          dd("Respuesta en controller: ", $payment);
            
            /* DB::commit(); */

            /* $invoice = Invoice::create([
                'payment_id' => $payment->id,
                'status' => 'pending', // Aún no enviado al SII
                'patient_id' => $data['patient_id'],
            ]); */

            /* foreach ($data['session_ids'] as $sessionId) {
              $session = TreatmentSession::find($sessionId);
              $sessionDate = \Carbon\Carbon::parse($session->session_date)->format('d-m-Y');
              InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'treatment_session_id' => $sessionId,
                    'treatment_id' => $session->treatment_id,
                    'description' => 'Sesión de Terapia (' . $sessionDate . ')',
                    'quantity' => 1, // Siempre 1
                    'unit_price_clp' => $session->patient_amount,
                    'total_clp' => $session->patient_amount,
                ]);
            } */

            /* EmitDteJob::dispatch($invoice); */

            session()->flash('message', 'Pago agregado correctamente');
            session()->flash('type', 'success');
            return back();
     } 
     catch (\Exception $e) {
            Log::info('Error al crear pago', [
                $e->getMessage()
            ]);
            
            session()->flash('message', 'Error al crear la pago: ' . $e->getMessage());
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
