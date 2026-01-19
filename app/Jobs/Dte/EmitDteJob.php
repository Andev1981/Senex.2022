<?php

namespace App\Jobs\Dte;

use App\Models\Invoice;
use App\Services\Dte\DteService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Mail\DteEmissionFailed;
use Illuminate\Support\Facades\Mail;

class EmitDteJob implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public int $tries = 3; // reintentos
  public int $backoff = 10; // segundos entre intentos (puedes usar array [10, 60, 300])

  public function __construct(
    public int $invoiceId,
    public ?int $branchId = null,
  ) {}

  public function handle(DteService $dteService): void
  {
    $invoice = Invoice::findOrFail($this->invoiceId);

    // Idempotencia: Si ya está enviado o aceptado, no hacemos nada.
    if (in_array($invoice->dte_status, [Invoice::SII_STATUS_SENT, Invoice::SII_STATUS_ACCEPTED])) {
        return;
    }

    try {
        // Delegamos TODA la lógica al servicio centralizado
        $trackId = $dteService->issueInvoiceDte($invoice);

        // Si obtenemos trackId, encolamos el chequeo de estado
        if ($trackId) {
            CheckDteStatusJob::dispatch($invoice->id)->delay(now()->addMinutes(5));
        }

    } catch (\Throwable $e) {
        // Si falla, el worker intentará de nuevo según $tries
        // Pero marcamos error temporal en la boleta para visibilidad
        $invoice->update([
            'dte_status' => 'PENDING_RETRY', // Estado intermedio
            'dte_notes' => 'Fallo en Job: ' . $e->getMessage()
        ]);
        
        throw $e; // Re-lanzar para que Laravel maneje el retry y backoff
    }
  }

  public function failed(\Throwable $exception): void
  {
      $invoice = Invoice::with('patient')->find($this->invoiceId);
      
      if ($invoice) {
          // 1. Actualizar estado en DB
          $invoice->update([
              'dte_status' => 'FAILED',
              'metadata' => $exception->getMessage()
          ]);

          // 2. Enviar correo al Administrador (o al dueño de la clínica)
          // Puedes usar una dirección fija o el correo de la configuración
          $adminEmail = config('mail.admin_address'); 
          Mail::route('mail', $adminEmail)->notify(new DteEmissionFailed($invoice,$exception->getMessage()));
      }
}
}
