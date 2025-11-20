<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentNowRequest;
use App\Models\Debt;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\TreatmentSession;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
  public function chargeNowForSession(PaymentNowRequest $req, PaymentService $svc, TreatmentSession $session)
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
    $amount    = $req->input('amount');

    $payment = \App\Models\Payment::findOrFail($paymentId);
    $svc->allocateToInvoice($payment, $invoice, $amount ? (float)$amount : null);

    return back()->with('ok', 'Pago asignado a factura.'); */
  }

  public function settleDebt(Request $req, PaymentService $svc, Debt $debt)
  {
    /* $this->authorize('update', $debt);
    $paymentId = $req->input('payment_id');
    $amount    = $req->input('amount');

    $payment = \App\Models\Payment::findOrFail($paymentId);
    $svc->settleDebtWithPayment($debt, $payment, $amount ? (float)$amount : null);

    return back()->with('ok', 'Deuda actualizada.'); */
  }

  public function store(Request $request){
    

    $data = $request->validate([
      'patient_id' => 'required',
      'treatment_id' => 'required',
      'payment_date' => 'required',
      'amount' => 'required',
      'paid_at' => 'required',
      'payment_method' => 'required',
      'transaction_reference' => 'nullable',
      'status' => 'required',
      'notes' => 'nullable',
      'session_ids' => 'required|array',
    ]);
     try {
          $payment = Payment::create([
                'patient_id' => $data['patient_id'],
                'treatment_id' => $data['treatment_id'],
                'payment_date' => $data['payment_date'],
                'amount' => $data['amount'],
                'paid_at' => $data['payment_date'],
                'payment_method' => $data['payment_method'],
                'transaction_reference' => $data['transaction_reference'],
                'status' => $data['status'],
                'notes' => $data['notes'],
              ]);

            foreach ($data['session_ids'] as $sessionId) {
              $session = TreatmentSession::find($sessionId);
              $debt = $session->debt;

              PaymentAllocation::create([
                    'payment_id' => $payment->id,
                    'treatment_session_id' => $sessionId,
                    'debt_id' => $debt->id,
                    'amount' => $session->patient_amount, // o lo que corresponda
                ]);

                $debt->update(['status' => 'paid']);
            }

            session()->flash('message', 'Pago agregado correctamente');
            session()->flash('type', 'success');
     } 
     catch (\Exception $e) {
            Log::info('Error al crear pago', [
                $e->getMessage()
            ]);
            
            session()->flash('message', 'Error al crear la pago: ' . $e->getMessage());
            session()->flash('type', 'error');
     }


  }
}
