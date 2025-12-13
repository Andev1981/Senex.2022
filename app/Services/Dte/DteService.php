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
        // 1. Validar y Cargar la Configuración Multi-Empresa
        $config = $this->cargarConfiguracion($invoice->company_id);

        // 2. ✅ AHORA: ASIGNAR Y CONSUMIR EL FOLIO AQUÍ
        // La responsabilidad de usar el FoliosService es del DteService.
        // Esto te devuelve el objeto Folios (CAF) y el número reservado.
        list($objetoFolios, $folioReservado) = $this->foliosService->reservarFolio(
            $invoice->company_id, 
            $invoice->type 
        );
        
        $invoice->folio = $folioReservado;
        $invoice->save(); // Persistir el folio en la tabla 'invoices'

        // 3. Generar el PAYLOAD (Array)
        $payloadArray = $this->payloadMapper->mapInvoiceToPayload($invoice, $config);

        // 4. DELEGACIÓN CLAVE: Llama a issue(), pasándole el objeto Folios
        // El objeto Folios (CAF) es necesario para el timbrado.
        $result = $this->dteProvider->issue($payloadArray, $config, $objetoFolios);

        // 5. Destructuración y Registro de Seguimiento
        list($trackId, $xmlFirmado) = $result; 

        $this->guardarRegistroDte($invoice, $trackId, $xmlFirmado); 

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
}