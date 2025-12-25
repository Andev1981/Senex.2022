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
        // 1. Cargar Configuración (Aquí viene el RUT de la empresa)
        $config = $this->cargarConfiguracion($invoice->company_id);

        // 2. Determinar Tipo (33, 39, 41)
        $tipoDte = $this->calculator->calculateAndDetermineType($invoice);

        // Actualizamos el invoice
        $invoice->dte_type = $tipoDte;
        $invoice->save();

        // ---------------------------------------------------------
        // 3. RESERVAR FOLIO (CORREGIDO)
        // ---------------------------------------------------------
        // Ahora pasamos los 3 argumentos que tu servicio espera:
        // 1. ID Empresa, 2. RUT Emisor, 3. Tipo DTE
        list($objetoFolios, $folioReservado) = $this->foliosService->reservarFolio(
            $invoice->company_id,       // int $company
            $config['rut_empresa'],     // string $rutEmisor (Lo sacamos de la config cargada)
            $tipoDte                    // int $tipoDTE
        );

        $invoice->dte_folio = $folioReservado;
        $invoice->save();

        // 4. Generar Payload
        $payloadArray = $this->payloadMapper->mapInvoiceToPayload($invoice, $config, $tipoDte);

        // 5. Emitir
        $result = $this->dteProvider->issue($payloadArray, $config, $objetoFolios);
        list($trackId, $xmlFirmado) = $result;

        // 6. Guardar Registro
        $this->guardarRegistroDte($invoice, $tipoDte, $folioReservado, $trackId, $xmlFirmado);

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
    public function checkDteStatus(string $trackId, int $companyId): string
    {
        $config = $this->cargarConfiguracion($companyId);

        // Llama al método status() definido en la Interfaz DteServiceProvider
        $status = $this->dteProvider->status($trackId, $config);

        // Lógica de negocio para actualizar el estado en el modelo Dte.
        Dte::where('track_id', $trackId)->update(['estado_sii' => $status]);

        return $status;
    }

    // --- MÉTODOS AUXILIARES ---

    /**
     * Carga la configuración del certificado y ambiente para una empresa.
     */
    protected function cargarConfiguracion(int $companyId): array
    {
        // Buscar la configuración en la tabla 'dte_configuracion'
        $config = Company::findOrFail($companyId)->dteConfig; // Asume una relación 1:1

        if (!$config) {
            throw new Exception("Configuración DTE no encontrada para la Compañía ID: {$companyId}");
        }

        // Retorna un array con las credenciales necesarias
        return [
            'rut_empresa' => $config->rut_emisor, // Usado en el XML
            'ambiente' => $config->ambiente,
            'path' => storage_path('app/' . $config->certificado_path), // Ruta completa del PFX
            'password' => decrypt($config->certificado_password), // Importante: desencriptar
        ];
    }

    /**
     * Guarda el registro final del DTE en la tabla 'dtes'.
     */
    protected function guardarRegistroDte(Invoice $invoice, string $trackId, string $xmlFirmado): Dte
    {
        return Dte::create([
            'company_id' => $invoice->company_id,
            'branch_id' => $invoice->branch_id,
            'type' => $invoice->type,
            'folio' => $invoice->folio,
            'rut_emisor' => $invoice->rut_emisor, // O tomarlo de la configuración
            'xml_data' => $xmlFirmado,
            'track_id' => $trackId,
            'estado_sii' => 'ENVIADO', // Estado inicial tras la recepción del Track ID
            // ... otros campos DTE
        ]);
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
