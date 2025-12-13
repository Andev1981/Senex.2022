<?php

namespace App\Services\Dte;

use App\Contracts\DteServiceProvider;
use App\Models\Invoice;
use sasco\LibreDTE\FirmaElectronica;
use sasco\LibreDTE\Sii\EnvioDte;
use sasco\LibreDTE\Sii\Dte;
use sasco\LibreDTE\Sii\Autenticacion; // Necesaria para status()
use sasco\LibreDTE\Sii\Folios;
use App\Services\Dte\LibreDtePayloadMapper;

class LibreDteLocalProvider implements DteServiceProvider
{
    protected FirmaElectronica $firmaDte;
    protected DteFoliosService $foliosService;
    protected string $ambiente;
    protected LibreDtePayloadMapper $mapper; // ⬅️ Nueva propiedad

    public function __construct(FirmaElectronica $firmaDte, DteFoliosService $foliosService, LibreDtePayloadMapper $mapper)
    {
        $this->firmaDte = $firmaDte;
        $this->foliosService = $foliosService;
        $this->ambiente = (string) config('dte.ambiente', 'homologacion');
        $this->mapper = $mapper; // ⬅️ Almacenar el mapeador
    }

    /**
     * @param array $payloadArray El array con la estructura DTE, incluyendo el Folio.
     * @param array $config La configuración de la empresa (rut, path, password, ambiente).
     * @return array [string $trackId, string $xmlFirmado]
     */
   // 🎯 INTERFAZ ACTUALIZADA: Acepta el objeto Folios
    public function issue(array $payloadArray, array $config = [], Folios $objetoFolios): array
    {
        // 1. VERIFICACIÓN Y CARGA DE LA FIRMA
        // ... (Tu lógica existente para cargar $Firma) ...
        $Firma = new FirmaElectronica($config['certificado_path'], $config['certificado_password']);

        // 2. CREACIÓN DEL DTE
        try {
            $dte = new Dte($payloadArray, true); 
        } catch (\Exception $e) {
             throw new \RuntimeException('Error al inicializar DTE: ' . $e->getMessage());
        }

        // 3. TIMBRADO (Usa el objeto Folios pasado por el DteService)
        if (!$dte->timbrar($objetoFolios)) {
            throw new \RuntimeException('Error de timbrado DTE. Verifique el CAF.');
        }

        // 4. FIRMA FINAL
        if (!$dte->firmar($Firma)) {
            throw new \RuntimeException('Error al firmar DTE.');
        }
        
        // 5. EMPAQUETAR Y ENVIAR
        $envio = new EnvioDte();
        $envio->agregar($dte); 
        $xmlFirmado = $dte->saveXML();

        // 6. ASIGNACIÓN DEL CERTIFICADO Y CARÁTULA
        // ... (Tu lógica existente para setFirma y setCaratula) ...

        // 7. ENVÍO AL SII Y RETORNO
        $respSii = $envio->enviar(); 
        if (!$respSii->status) {
             throw new \RuntimeException('DTE_SII_ERROR: ' . $respSii->msg);
        }
        
        return [
            $respSii->track_id, 
            $xmlFirmado,
        ];
    }
    /**
     * Consulta el estado del envío al SII usando el Track ID.
     * * @param int|string $trackId ID de seguimiento devuelto por el SII.
     * @return array
     */
    public function status(int|string $trackId, array $config = []): string
    {
        // El estado por defecto si falla algo.
        $defaultStatus = 'FALLO_TECNICO';

        try {
            // 1. CARGAR LA FIRMA con la configuración multi-empresa
            $Firma = new FirmaElectronica($config['path'], $config['password']);
            
            // 2. Obtener Token de autenticación del SII
            $token = Autenticacion::getToken($Firma);
            
            if (!$token) {
                return 'FALLO_AUTH'; // No se pudo obtener Token
            }

            // 3. Obtener el RUT Emisor de la Firma
            $rutEnvia = $Firma->getID(); // RUT con formato XX.XXX.XXX-X
            
            if (!is_string($rutEnvia)) {
                // Si la firma no tiene RUT, hay un problema con el certificado
                throw new \Exception("RUT de Emisor no encontrado en el certificado.");
            }
            
            list($RutEnvia, $DvEnvia) = explode('-', $rutEnvia);

            // 4. Llamada al Web Service QueryEstUp
            $xmlRespuesta = \sasco\LibreDTE\Sii::request('QueryEstUp', 'getEstUp', [
                'RutClient' => $RutEnvia,
                'DvClient' => $DvEnvia,
                'TrackId' => (string) $trackId,
                'token' => $token,
            ]);

            if ($xmlRespuesta === false) {
                 return 'FALLO_RESPUESTA'; // Error de conexión o respuesta vacía del SII
            }
            
            // 5. Parsear y devolver el estado
            // La respuesta de getEstUp (RECEPCIONDTE) tiene el estado en RESP_HDR
            $respArray = (array)$xmlRespuesta->xpath('/RECEPCIONDTE/RESP_HDR')[0];
            
            // Los estados posibles son: RECIBIDO, ACEPTADO, RECHAZADO, etc.
            $estadoSII = $respArray['ESTADO'] ?? 'DESCONOCIDO'; 
            
            return $estadoSII;

        } catch (\Exception $e) {
            // Aquí puedes registrar el error en los logs de Laravel.
            // Log::error('DTE_STATUS_ERROR', ['track_id' => $trackId, 'message' => $e->getMessage()]);
            return 'EXCEPCION';
        }
    }

}