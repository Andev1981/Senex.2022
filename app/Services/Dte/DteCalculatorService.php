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
    // Forzar recarga de ítems desde la DB para evitar colecciones vacías en memoria
    $invoice->load('items');

    $netoTotal = 0;
    $ivaTotal = 0;
    $exentoTotal = 0;
    
    // 1. Determinar si hay ítems afectos (is_exento es false o 0)
    $tieneItemsAfectos = $invoice->items->filter(function($item) {
        return !((bool)$item->is_exento);
    })->count() > 0;

    $tipoDte = $this->determineType($invoice, $tieneItemsAfectos);

    // 2. Calcular montos línea por línea
    foreach ($invoice->items as $item) {
      $montoLinea = (int) $item->total_gross_clp;

      if ((bool)$item->is_exento) {
        $exentoTotal += $montoLinea;
      } else {
        // REGLA SII CHILE:
        if ($tipoDte === 39 || $tipoDte === 41) {
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

    // 3. Aplicar descuento global (prorrateado)
    $globalDiscount = (int)($invoice->global_discount_clp ?? 0);
    if ($globalDiscount > 0) {
        // ... lógica de descuento simplificada para el DTE ...
        if ($exentoTotal >= $globalDiscount) {
            $exentoTotal -= $globalDiscount;
        } else {
            $diferencial = $globalDiscount - $exentoTotal;
            $exentoTotal = 0;
            $netoTotal = max(0, $netoTotal - (int)round($diferencial / 1.19));
            $ivaTotal = (int)($invoice->total_amount_clp - $netoTotal - $exentoTotal);
        }
    }

    // 4. Sincronizar Modelo Local
    $invoice->net_amount_clp = $netoTotal;
    $invoice->exempt_amount_clp = $exentoTotal;
    $invoice->vat_amount_clp = $ivaTotal;
    $invoice->total_amount_clp = $netoTotal + $ivaTotal + $exentoTotal;
    $invoice->dte_type = $tipoDte;
    
    $invoice->save(); 

    return $tipoDte;
  }

  private function determineType(Invoice $invoice, bool $tieneItemsAfectos): int
  {
    $rutReceptor = data_get($invoice->metadata, 'client.rut', '0');
    $rutNumerico = (int) str_replace(['.', '-'], '', $rutReceptor);
    $esEmpresa = $rutNumerico > 50000000 || ($invoice->entity_type === 'App\Models\Company');

    $intentType = (int)$invoice->dte_type;

    // Categoría Factura (33, 34)
    if (in_array($intentType, [33, 34])) {
        return $tieneItemsAfectos ? 33 : 34;
    }
    
    // Categoría Boleta (39, 41)
    if (in_array($intentType, [39, 41])) {
        return $tieneItemsAfectos ? 39 : 41;
    }

    // Fallback: Si no hay intención previa, decidir por RUT
    if ($esEmpresa) {
      return $tieneItemsAfectos ? 33 : 34;
    }

    return $tieneItemsAfectos ? 39 : 41;
  }
}
