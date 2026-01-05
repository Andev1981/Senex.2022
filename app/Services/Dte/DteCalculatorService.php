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
    
    // El tipo debe determinarse antes para saber si calculamos desde Bruto o Neto
    $tieneItemsAfectos = $invoice->items->contains('is_exento', false);
    $tipoDte = $this->determineType($invoice, $tieneItemsAfectos);

    foreach ($invoice->items as $item) {
      $montoLinea = (float) $item->total_gross_clp; // En el controlador esto se guarda como qty * unitPrice

      if ($item->is_exento) {
        $exentoTotal += $montoLinea;
      } else {
        // REGLA SII CHILE:
        if ($tipoDte === Invoice::TYPE_BOLETA || $tipoDte === Invoice::TYPE_BOLETA_EXENTA) {
            // Boleta: El valor ingresado es BRUTO (Total). Calculamos el neto.
            $netoLinea = (int) round($montoLinea / 1.19);
            $ivaLinea = (int) ($montoLinea - $netoLinea);
        } else {
            // Factura: El valor ingresado es NETO. Calculamos el IVA.
            $netoLinea = (int) $montoLinea;
            $ivaLinea = (int) round($netoLinea * 0.19);
        }
        
        $netoTotal += $netoLinea;
        $ivaTotal += $ivaLinea;
      }
    }

    // Aplicar descuento global proporcional
    $globalDiscount = $invoice->global_discount_clp ?? 0;
    if ($globalDiscount > 0) {
        if ($netoTotal >= $globalDiscount) {
            $netoTotal -= $globalDiscount;
        } else {
            $diff = $globalDiscount - $netoTotal;
            $netoTotal = 0;
            $exentoTotal = max(0, $exentoTotal - $diff);
        }
        // Recalcular IVA tras descuento sobre el nuevo neto
        $ivaTotal = (int) round($netoTotal * 0.19);
    }

    // Actualizar el Modelo Invoice
    $invoice->amount_neto_clp = $netoTotal;
    $invoice->amount_exento_clp = $exentoTotal;
    $invoice->amount_iva_clp = $ivaTotal;
    $invoice->amount_total_clp = $netoTotal + $ivaTotal + $exentoTotal;
    $invoice->dte_type = $tipoDte;
    
    $invoice->save(); 

    return $tipoDte;
  }

  private function determineType(Invoice $invoice, bool $tieneItemsAfectos): int
  {
    // B2B: Si el RUT es de empresa (> 50M) o el receptor es una Company
    $rutReceptor = data_get($invoice->metadata, 'client.rut', '0');
    $rutNumerico = (int) str_replace(['.', '-'], '', $rutReceptor);
    
    // Si el usuario forzó un tipo en el request, respetarlo si es posible
    if ($invoice->dte_type && in_array($invoice->dte_type, [33, 34, 39, 41])) {
        return $invoice->dte_type;
    }

    $esEmpresa = $rutNumerico > 50000000 || ($invoice->entity_type === 'App\Models\Company');

    if ($esEmpresa) {
      return $tieneItemsAfectos ? 33 : 34;
    }

    return $tieneItemsAfectos ? 39 : 41;
  }
}
