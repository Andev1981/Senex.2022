<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentNowRequest;
use App\Models\Debt;
use App\Models\Invoice;
use App\Models\TreatmentSession;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentsController extends Controller
{
  public function chargeNowForSession(PaymentNowRequest $req, PaymentService $svc, TreatmentSession $session)
  {
    $this->authorize('update', $session);
    $payment = $svc->chargeNowForSession($session, $req->input('method'));

    return back()->with('ok', "Pago registrado (#{$payment->id})");
  }

  public function createWebpay(Request $req, PaymentService $svc, TreatmentSession $session)
  {
    $this->authorize('update', $session);
    $result = $svc->createWebpayTransaction(
      $session->patient_id,
      (float)$session->patient_amount,
      ['treatment_session_id' => $session->id]
    );

    // redirige a pasarela
    return redirect()->away($result['redirect']);
  }

  // returnUrl/finish de WebPay
  public function confirmWebpay(Request $req, PaymentService $svc)
  {
    $token = $req->get('token_ws') ?? $req->get('TBK_TOKEN');
    $payment = $svc->confirmWebpayTransaction((string)$token);

    return redirect()->route('payments.show', $payment)
      ->with($payment->status === 'completed' ? 'ok' : 'error', 'Pago ' . $payment->status);
  }

  public function allocateToInvoice(Request $req, PaymentService $svc, Invoice $invoice)
  {
    $this->authorize('update', $invoice);
    $paymentId = $req->input('payment_id');
    $amount    = $req->input('amount');

    $payment = \App\Models\PaymentTransaction::findOrFail($paymentId);
    $svc->allocateToInvoice($payment, $invoice, $amount ? (float)$amount : null);

    return back()->with('ok', 'Pago asignado a factura.');
  }

  public function settleDebt(Request $req, PaymentService $svc, Debt $debt)
  {
    $this->authorize('update', $debt);
    $paymentId = $req->input('payment_id');
    $amount    = $req->input('amount');

    $payment = \App\Models\PaymentTransaction::findOrFail($paymentId);
    $svc->settleDebtWithPayment($debt, $payment, $amount ? (float)$amount : null);

    return back()->with('ok', 'Deuda actualizada.');
  }
}
