<?php

namespace App\Services\Dte;

use App\Contracts\DteServiceProvider; // Tu Interfaz
use App\Models\Invoice; // El documento de origen
use App\Models\Dte;     // El modelo para el registro de seguimiento SII
use App\Models\Company; // Para cargar la configuración DTE
use App\Services\Dte\DteFoliosService; // Tu servicio para folios
use Exception;

class DteService
{
    // Inyección de Dependencias
    public function __construct(
        // Inyectamos la Interfaz. Laravel le entregará LibreDteLocalProvider (el Binding)
        protected DteCalculatorService $calculator,
        protected DteServiceProvider $dteProvider,
        protected DteFoliosService $foliosService,
        // Inyectamos el Mapper para generar el XML (LibreDtePayloadMapper.php)
        protected LibreDtePayloadMapper $payloadMapper
    ) {}

    /**
     * Método principal de negocio: Orquesta la emisión de un DTE a partir de una Factura.
     * @param Invoice $invoice El objeto Factura ya persistido.
     * @return string El Track ID devuelto por el SII.
     */

    public function issueInvoiceDte(Invoice $invoice): string
    {
        // 1. Cargar Configuración
        $config = $this->cargarConfiguracion($invoice->company_id);

        // 2. Determinar Tipo
        $tipoDte = $invoice->dte_type ?: $this->calculator->calculateAndDetermineType($invoice);

        // ---------------------------------------------------------
        // 3. GESTIÓN DE FOLIOS (REINTENTO INTELIGENTE)
        // ---------------------------------------------------------
        $folioAUsar = $invoice->dte_folio;
        $objetoFolios = null;

        // REGLA: Si tiene folio y NO fue rechazado formalmente por el SII (o sea, es nuevo o error técnico), reutilizamos.
        if ($folioAUsar && $invoice->dte_status !== Invoice::SII_STATUS_REJECTED) {
            $objetoFolios = $this->foliosService->recuperarCAF($invoice->company_id, $tipoDte);
        } else {
            // Si no tiene folio o el SII rechazó el anterior, reservamos uno nuevo.
            list($objetoFolios, $folioAUsar) = $this->foliosService->reservarFolio(
                $invoice->company_id,
                $config['rut_empresa'],
                $tipoDte
            );
            $invoice->dte_folio = $folioAUsar;
        }

        $invoice->save();

        // 4. Generar Payload
        $payloadArray = $this->payloadMapper->mapInvoiceToPayload($invoice, $config, $tipoDte);

        // 5. Emitir
        $result = $this->dteProvider->issue($payloadArray, $config, $objetoFolios);
        list($trackId, $xmlFirmado) = $result;

        // 6. Guardar Registro y Actualizar Factura
        $this->guardarRegistroDte($invoice, $tipoDte, $folioAUsar, $trackId, $xmlFirmado);
        
        $invoice->update(['dte_status' => Invoice::SII_STATUS_SENT]);

        return $trackId;
    }

    /**
     * Emite una Nota de Crédito Electrónica (Tipo 61).
     * * @param Invoice $invoice La venta original que queremos anular/corregir.
     * @param int $codRef Código de referencia (1: Anula, 2: Corrige texto, 3: Corrige monto).
     * @param string $razonRef Razón de la anulación (ej: "Error de digitación").
     */
    public function issueCreditNoteDte(Invoice $invoice, int $codRef, string $razonRef): string
    {
        // 1. Cargar Configuración
        $config = $this->cargarConfiguracion($invoice->company_id);

        // 2. Obtener el DTE Original (el que vamos a anular)
        // Buscamos el último DTE aceptado asociado a esta venta.
        $dteOriginal = $invoice->dtes()
            ->where('estado_sii', 'ACEPTADO') // O el estado que uses para "Valido"
            ->latest()
            ->first();

        if (!$dteOriginal) {
            throw new \Exception("No se encontró un DTE Aceptado asociado a esta venta para anular.");
        }

        // 3. Reservar Folio para Nota de Crédito (Tipo 61)
        list($objetoFolios, $folioReservado) = $this->foliosService->reservarFolio(
            $invoice->company_id,
            $config['rut_empresa'], // Pasamos el RUT Emisor como string
            61                      // Tipo fijo para Nota de Crédito
        );

        // 4. Preparar la Referencia (Exigido por el SII)
        $referenciaData = [
            'NroLinRef' => 1,
            'TpoDocRef' => $dteOriginal->type, // Ej: 39 (Boleta) o 33 (Factura)
            'FolioRef'  => $dteOriginal->folio,
            'FchRef'    => $dteOriginal->created_at->format('Y-m-d'), // Fecha emisión original
            'CodRef'    => $codRef,
            'RazonRef'  => mb_substr($razonRef, 0, 90) // Limitar largo
        ];

        // 5. Generar Payload
        // Usamos el mismo mapper, pero le decimos que es Tipo 61 y le pasamos la referencia
        $payloadArray = $this->payloadMapper->mapInvoiceToPayload(
            $invoice,
            $config,
            61,             // Tipo DTE
            $referenciaData // Argumento opcional que agregamos al mapper
        );

        // 6. Emitir en LibreDTE
        $result = $this->dteProvider->issue($payloadArray, $config, $objetoFolios);
        list($trackId, $xmlFirmado) = $result;

        // 7. Guardar el nuevo DTE (La Nota de Crédito)
        $ncDte = $this->guardarRegistroDte(
            $invoice,
            61,
            $folioReservado,
            $trackId,
            $xmlFirmado
        );

        // 8. Vincular con el Padre (Trazabilidad)
        $ncDte->related_dte_id = $dteOriginal->id;
        $ncDte->save();

        // 9. Actualizar el estado de la venta (Solo si es anulación total)
        if ($codRef === 1) {
            $invoice->payment_status = 'refunded'; // O 'voided'
            $invoice->save();
        }

        return $trackId;
    }

    /**
     * Lógica auxiliar para consultar el estado del DTE asíncronamente (usado por un Job o Command).
     * @param string $trackId El ID de seguimiento del SII.
     * @param int $companyId El ID de la empresa para cargar la configuración.
     * @return string El estado final del DTE.
     */
    public function checkDteStatus(string $trackId, int $companyId): array
    {
        try {
            $config = $this->cargarConfiguracion($companyId);

            // Llama al método status() que ahora devuelve un array [estado, glosa]
            $result = $this->dteProvider->status($trackId, $config);

            if (!is_array($result)) {
                $result = [
                    'estado' => 'ERROR_INTERNO',
                    'glosa' => 'El proveedor de DTE no devolvió un formato válido.'
                ];
            }

            // Lógica de negocio para actualizar el estado y la glosa en el modelo Dte.
            \App\Models\Dte::where('track_id', $trackId)->update([
                'estado_sii' => $result['estado'] ?? 'ERROR',
                'glosa_rechazo' => $result['glosa'] ?? 'Sin detalle'
            ]);

            return $result;
        } catch (\Exception $e) {
            return [
                'estado' => 'ERROR',
                'glosa' => $e->getMessage()
            ];
        }
    }

    // --- MÉTODOS AUXILIARES ---

    /**
     * Carga la configuración del certificado y ambiente para una empresa.
     */
    protected function cargarConfiguracion(int $companyId): array
    {
        // Buscar la configuración en la tabla 'dte_configuracion'
        $config = Company::findOrFail($companyId)->dteConfiguration; // Nombre corregido

        if (!$config) {
            throw new Exception("Configuración DTE no encontrada para la Compañía ID: {$companyId}");
        }

        // Retorna un array con las credenciales necesarias
        return [
            'rut_empresa' => $config->rut_empresa, 
            'ambiente' => $config->ambiente,
            'path' => Storage::disk('private')->path($config->certificado_path), 
            'password' => decrypt($config->certificado_password), 
        ];
    }

    /**
     * Guarda o actualiza el registro final del DTE en la tabla 'dtes'.
     */
    protected function guardarRegistroDte(Invoice $invoice, int $tipo, int $folio, string $trackId, string $xmlFirmado): Dte
    {
        return Dte::updateOrCreate(
            [
                'company_id' => $invoice->company_id,
                'type' => $tipo,
                'folio' => $folio
            ],
            [
                'branch_id' => $invoice->branch_id,
                'rut_emisor' => $invoice->company->rut ?? '76000000-1',
                'rut_receptor' => data_get($invoice->metadata, 'client.rut', '1-9'),
                'total_monto_clp' => $invoice->amount_total_clp,
                'xml_data' => $xmlFirmado,
                'track_id' => $trackId,
                'estado_sii' => 'ENVIADO',
                'origin_type' => 'Invoice',
                'origin_id' => $invoice->id
            ]
        );
    }

    public function calcularYDeterminarTipo(Invoice $invoice)
    {
        $neto = 0;
        $iva = 0;
        $exento = 0;
        $tieneItemsAfectos = false;

        foreach ($invoice->items as $item) {
            if ($item->is_exento) {
                $exento += $item->total_gross_clp; // Asumiendo que guardas el bruto
            } else {
                $tieneItemsAfectos = true;
                // Desglosar IVA del bruto (en Chile precios B2C incluyen IVA)
                $netoLinea = round($item->total_gross_clp / 1.19);
                $ivaLinea = $item->total_gross_clp - $netoLinea;

                $neto += $netoLinea;
                $iva += $ivaLinea;
            }
        }

        // --- DECISIÓN CRÍTICA DE TIPO DTE ---

        // CASO 1: Si es FACTURA (B2B), siempre es 33 (Afecta) o 34 (Exenta).
        // Si la venta es mixta y piden factura, se usa la 33 y se detallan los códigos de exención por línea.
        if ($invoice->requires_factura) {
            return $tieneItemsAfectos ? 33 : 34;
        }

        // CASO 2: BOLETAS (B2C)
        // Si tiene AL MENOS UN ítem afecto, debe ser Boleta Electrónica (39).
        // La Boleta 39 soporta montos exentos dentro de ella.
        if ($tieneItemsAfectos) {
            return 39;
        }

        // Si TODO es exento (solo prestaciones de salud), usamos Boleta Exenta (41).
        return 41;
    }
}
