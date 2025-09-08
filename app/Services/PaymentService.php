<?php

namespace App\Services;

use App\Models\{PaymentTransaction, TreatmentSession, Debt, Invoice, PaymentAllocation};
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PaymentService
{
  /**
   * Crea y completa un pago inmediato para una sesión (cash/transfer o webpay ya confirmado).
   * Si fuese WebPay “dos pasos”, crea en pending y confirma luego con confirmTransaction().
   */
  public function chargeNowForSession(TreatmentSession $session, string $method): PaymentTransaction
  {
    if (!$session->patient_amount || $session->patient_amount <= 0) {
      throw new RuntimeException('Monto inválido para pago.');
    }

    return DB::transaction(function () use ($session, $method) {
      $txn = PaymentTransaction::query()->create([

        'patient_id'            => $session->patient_id,
        'treatment_session_id'  => $session->id,
        'amount'                => $session->patient_amount,
        'payment_method'        => $method,
        'status'                => PaymentTransaction::STATUS_COMPLETED,
        'paid_at'               => now(),
        'currency'              => 'CLP',
        'provider_txn_id'       => null,
        'provider_payload'      => [],
        'notes'                 => 'Pago inmediato registrado en recepción',
      ]);

      return $txn;
    });
  }

  /**
   * Flujo WebPay “dos pasos”: crear transacción (pending) y devolver URL/Token.
   * El controller redirige al frontend de WebPay. Luego confirmas con confirmTransaction().
   */
  public function createWebpayTransaction(int $patientId, float $amount, array $meta = []): array
  {
    // 1) Crear PaymentTransaction en pending
    $txn = PaymentTransaction::query()->create([

      'patient_id'       => $patientId,
      'treatment_session_id' => $meta['treatment_session_id'] ?? null,
      'amount'           => $amount,
      'payment_method'   => PaymentTransaction::METHOD_WEBPAY,
      'status'           => PaymentTransaction::STATUS_PENDING,
      'currency'         => 'CLP',
      'provider_txn_id'  => null,
      'provider_payload' => [],
      'notes'            => 'WebPay init',
    ]);

    // 2) Llamar API Transbank para crear transacción y obtener token/url
    // TODO: integrar SDK Transbank aquí
    $webpay = [
      'token' => 'FAKE_TOKEN_' . $txn->id,
      'url'   => 'https://webpay.tbk.cl/form-pay?token=FAKE_TOKEN_' . $txn->id,
    ];

    // 3) Guardar token en provider_txn_id
    $txn->provider_txn_id = $webpay['token'];
    $txn->provider_payload = ['init' => $webpay];
    $txn->save();

    return ['payment' => $txn, 'redirect' => $webpay['url'], 'token' => $webpay['token']];
  }

  /**
   * Confirmación WebPay después del pago en la pasarela.
   */
  public function confirmWebpayTransaction(string $token): PaymentTransaction
  {
    // 1) Buscar transacción por provider_txn_id
    $txn = PaymentTransaction::query()->where('provider_txn_id', $token)->firstOrFail();

    // 2) Llamar API Transbank para confirmar
    // TODO: integrar confirmación real
    $confirmed = true; // simulado

    // 3) Actualizar estado
    $txn->status = $confirmed ? PaymentTransaction::STATUS_COMPLETED : PaymentTransaction::STATUS_FAILED;
    $txn->paid_at = $confirmed ? now() : null;
    $payload = $txn->provider_payload ?? [];
    $payload['confirm'] = ['ok' => $confirmed];
    $txn->provider_payload = $payload;
    $txn->save();

    return $txn;
  }

  /**
   * Asigna un pago a una factura (DTE). Si cubre total, marca la factura pagada.
   */
  public function allocateToInvoice(PaymentTransaction $payment, Invoice $invoice, ?float $amount = null): PaymentAllocation
  {
    $amount = $amount ?? min((float)$payment->unallocated_amount, (float)$invoice->total_amount);

    if ($amount <= 0) {
      throw new RuntimeException('No hay monto disponible para asignar.');
    }

    return DB::transaction(function () use ($payment, $invoice, $amount) {
      $alloc = PaymentAllocation::query()->create([
        'payment_transaction_id' => $payment->id,
        'invoice_id'             => $invoice->id,
        'debt_id'                => null,
        'amount'                 => $amount,
      ]);

      // si quedó totalmente pagada, marcamos
      if ((float)$invoice->total_amount <= (float)$payment->allocated_amount) {
        $invoice->settleAsPaid();
      }

      return $alloc;
    });
  }

  /**
   * Asigna un pago a una deuda y actualiza su estado.
   */
  public function settleDebtWithPayment(Debt $debt, PaymentTransaction $payment, ?float $amount = null): PaymentAllocation
  {
    $amount = $amount ?? min((float)$payment->unallocated_amount, (float)$debt->balance);
    if ($amount <= 0) {
      throw new RuntimeException('No hay monto disponible para asignar o la deuda ya está saldada.');
    }

    return DB::transaction(function () use ($debt, $payment, $amount) {
      $alloc = PaymentAllocation::query()->create([
        'payment_transaction_id' => $payment->id,
        'invoice_id'             => null,
        'debt_id'                => $debt->id,
        'amount'                 => $amount,
      ]);

      $debt->paid_amount = max((float)$debt->paid_amount, (float) $debt->paymentAllocations()->sum('amount'));
      $debt->refreshStatus();

      return $alloc;
    });
  }
}
