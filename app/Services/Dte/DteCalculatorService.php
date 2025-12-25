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
      // Calculamos el total de la línea (Precio x Cantidad)
      // Asumimos que guardas el total bruto en 'total_gross_clp' en invoice_items
      $totalLinea = $item->total_gross_clp;

      if ($item->is_exento) {
        $exentoTotal += $totalLinea;
      } else {
        $tieneItemsAfectos = true;

        // Desglosar IVA (19%) desde el Bruto
        // Fórmula: Neto = Bruto / 1.19
        $netoLinea = round($totalLinea / 1.19);
        $ivaLinea = $totalLinea - $netoLinea;

        $netoTotal += $netoLinea;
        $ivaTotal += $ivaLinea;
      }
    }

    // 2. Actualizar el Modelo Invoice (Persistencia)
    // Guardamos los cálculos para que coincidan EXACTAMENTE con lo que enviaremos al SII
    $invoice->amount_neto_clp = $netoTotal;
    $invoice->amount_exento_clp = $exentoTotal;
    $invoice->amount_iva_clp = $ivaTotal;
    $invoice->amount_total_clp = $netoTotal + $ivaTotal + $exentoTotal;

    // 3. Determinar el Tipo DTE (Tu lógica, refinada)
    $tipoDte = $this->determineType($invoice, $tieneItemsAfectos);

    $invoice->dte_type = $tipoDte;
    $invoice->save(); // Guardamos todo en la BD

    return $tipoDte;
  }

  private function determineType(Invoice $invoice, bool $tieneItemsAfectos): int
  {
    // Lógica para detectar si es B2B (Factura)
    // Puede ser por un flag manual o si el receptor es una Empresa
    $esFactura = $invoice->requires_factura
      || ($invoice->entity_type === 'App\Models\Company');

    // CASO 1: FACTURA (B2B)
    if ($esFactura) {
      // Si hay items afectos, es Factura Electrónica (33)
      // Si TODO es exento, es Factura Exenta (34)
      return $tieneItemsAfectos ? 33 : 34;
    }

    // CASO 2: BOLETA (B2C)
    if ($tieneItemsAfectos) {
      // Si hay al menos un ítem afecto (o mixto), es Boleta Electrónica (39)
      return 39;
    }

    // Si TODO es exento (solo salud), es Boleta Exenta (41)
    return 41;
  }
}
