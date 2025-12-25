<?php

namespace App\Jobs\Dte;

use App\Models\Invoice;
use App\Services\Dte\LibreDteLocalProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckDteStatusJob implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public int $tries = 5;
  public $backoff = [60, 120, 300, 600, 900]; // escalado
  public function __construct(public int $invoiceId) {}
  public function handle( LibreDteLocalProvider $provider): void
  {
    $invoice = Invoice::query()->findOrFail($this->invoiceId);
    $dte = $invoice->currentDte();

    if (!$dte || !$dte->track_id) return;
    $r = $provider->status($dte->track_id);
    // Si aún está en proceso, reintenta luego
    if (($r['estado'] ?? null) === 'EN_PROCESO') {
      $this->release(300); // 5 minutos
      return;
    }
    $invoice->update([
      'dte_status' => $r['estado'] ?? $invoice->dte_status,
      'dte_status_note' => $r['glosa'] ?? null,
    ]);
  }
}
