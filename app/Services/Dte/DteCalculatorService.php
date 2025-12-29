<?php

namespace App\Services\Dte;

use App\Models\Invoice;

class DteCalculatorService
{
  /**
   * Calcula los montos netos/iva/exentos, actualiza el Invoice y retorna el Tipo DTE.
   */
  public function calculateAndDetermineType(Invoice $invoice): int
  {
    $netoTotal = 0;
    $ivaTotal = 0;
    $exentoTotal = 0;
    $tieneItemsAfectos = false;

    // 1. Iterar y Calcular (Matemática)
    foreach ($invoice->items as $item) {
      // El precio guardado en la BD es el NETO según el flujo actual
      $netoLinea = $item->total_gross_clp; 

      if ($item->is_exento) {
        $exentoTotal += $netoLinea;
      } else {
        $tieneItemsAfectos = true;

        // Calculamos el IVA (19%) sobre el neto
        $ivaLinea = (int) round($netoLinea * 0.19);
        
        $netoTotal += $netoLinea;
        $ivaTotal += $ivaLinea;
      }
    }

    // Aplicar descuento global proporcional si existe (Regla de negocio: se descuenta del neto primero)
    $globalDiscount = $invoice->global_discount_clp ?? 0;
    if ($globalDiscount > 0) {
        if ($netoTotal >= $globalDiscount) {
            $netoTotal -= $globalDiscount;
        } else {
            $diff = $globalDiscount - $netoTotal;
            $netoTotal = 0;
            $exentoTotal = max(0, $exentoTotal - $diff);
        }
        // Recalcular IVA tras el descuento global sobre el neto
        $ivaTotal = (int) round($netoTotal * 0.19);
    }

    // 2. Actualizar el Modelo Invoice (Persistencia)
    $invoice->amount_neto_clp = $netoTotal;
    $invoice->amount_exento_clp = $exentoTotal;
    $invoice->amount_iva_clp = $ivaTotal;
    $invoice->amount_total_clp = $netoTotal + $ivaTotal + $exentoTotal;

    // 3. Determinar el Tipo DTE (Regla 1)
    $tipoDte = $this->determineType($invoice, $tieneItemsAfectos);

    $invoice->dte_type = $tipoDte;
    $invoice->save(); 

    return $tipoDte;
  }

  private function determineType(Invoice $invoice, bool $tieneItemsAfectos): int
  {
    // B2B: Si el RUT es de empresa (> 50M) o el receptor es una Company
    $rutNumerico = (int) str_replace(['.', '-'], '', $invoice->metadata['client']['rut'] ?? '0');
    $esEmpresa = $rutNumerico > 50000000 || ($invoice->entity_type === 'App\Models\Company');

    if ($esEmpresa) {
      // Factura Electrónica (33) si hay afectos, Factura Exenta (34) si todo es exento
      return $tieneItemsAfectos ? 33 : 34;
    }

    // B2C: Boleta Electrónica (39) si hay afectos (mixta), Boleta Exenta (41) si 100% exento
    return $tieneItemsAfectos ? 39 : 41;
  }
}
