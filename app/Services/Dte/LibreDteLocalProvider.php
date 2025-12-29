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
        // --- MOCK PARA PRUEBAS (SOLO SI ES EL CERTIFICADO DUMMY) ---
        if (str_contains($config['path'], 'dummy.pfx')) {
            return [
                (string)rand(1000000, 9999999), // TrackID Aleatorio
                '<xml>Simulated signed DTE</xml>'
            ];
        }

        // 1. VERIFICACIÓN Y CARGA DE LA FIRMA (Formato Array exigido por LibreDTE)
        $Firma = new FirmaElectronica([
            'file' => $config['path'],
            'pass' => $config['password']
        ]);

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
    public function status(int|string $trackId, array $config = []): array
    {
        // El estado por defecto si falla algo.
        $defaultStatus = 'FALLO_TECNICO';

        try {
            // 1. CARGAR LA FIRMA con la configuración multi-empresa
            $Firma = new FirmaElectronica([
                'file' => $config['path'],
                'pass' => $config['password']
            ]);
            
            // 2. Obtener Token de autenticación del SII
            $token = Autenticacion::getToken($Firma);
            
            if (!$token) {
                return [
                    'estado' => 'FALLO_AUTH',
                    'glosa'  => 'No se pudo obtener el token de autenticación del SII. Verifique su certificado.'
                ];
            }

            // 3. Obtener el RUT Emisor de la Firma
            $rutEnvia = $Firma->getID(); // RUT con formato XX.XXX.XXX-X
            
            if (!is_string($rutEnvia)) {
                return [
                    'estado' => 'FALLO_FIRMA',
                    'glosa'  => 'El certificado digital no contiene un RUT válido.'
                ];
            }
            
            list($RutEnvia, $DvEnvia) = explode('-', $rutEnvia);

            // 4. Llamada al Web Service QueryEstUp
            $xmlRespuesta = \sasco\LibreDTE\Sii::request('QueryEstUp', 'getEstUp', [
                'RutClient' => $RutEnvia,
                'DvClient' => $DvEnvia,
                'TrackId' => (string) $trackId,
                'token' => $token,
            ]);

            if ($xmlRespuesta === false || !is_object($xmlRespuesta)) {
                 return [
                    'estado' => 'FALLO_RESPUESTA',
                    'glosa'  => 'El SII no respondió a la consulta o la respuesta fue vacía.'
                 ];
            }
            
            // 5. Parsear y devolver el estado y la glosa
            $headers = $xmlRespuesta->xpath('/RECEPCIONDTE/RESP_HDR');
            
            if (empty($headers)) {
                return [
                    'estado' => 'FALLO_SII',
                    'glosa' => 'El SII devolvió una respuesta ilegible o sin encabezado.'
                ];
            }

            $respArray = (array)$headers[0];
            
            return [
                'estado' => $respArray['ESTADO'] ?? 'DESCONOCIDO',
                'glosa'  => $respArray['ERR_CODE'] . ': ' . ($respArray['GLOSA'] ?? 'Sin detalle')
            ];

        } catch (\Exception $e) {
            return [
                'estado' => 'ERROR',
                'glosa'  => $e->getMessage()
            ];
        }
    }

}