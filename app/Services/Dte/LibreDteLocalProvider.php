<?php

namespace App\Services\Dte;

use App\Contracts\DteServiceProvider;
use sasco\LibreDTE\FirmaElectronica;
use sasco\LibreDTE\Sii\EnvioDte;
use sasco\LibreDTE\Sii\Dte;
use sasco\LibreDTE\Sii\Autenticacion;
use sasco\LibreDTE\Sii\Folios;
use Illuminate\Support\Facades\Log;

class LibreDteLocalProvider implements DteServiceProvider
{
    protected FirmaElectronica $firmaDte;
    protected DteFoliosService $foliosService;
    protected LibreDtePayloadMapper $mapper;

    public function __construct(FirmaElectronica $firmaDte, DteFoliosService $foliosService, LibreDtePayloadMapper $mapper)
    {
        $this->firmaDte = $firmaDte;
        $this->foliosService = $foliosService;
        $this->mapper = $mapper;
    }

    /**
     * @param array $payloadArray Structure for DTE.
     * @param array $config [company_rut, certificate_path, certificate_pass, environment, simulation_mode]
     * @param Folios $objetoFolios
     */
    public function issue(array $payloadArray, array $config = [], Folios $objetoFolios): array
    {
        if (!empty($config['simulation_mode']) && $config['simulation_mode'] === true) {
            return [
                (string)rand(1000000, 9999999),
                '<xml>Simulated signed DTE</xml>'
            ];
        }

        // 1. Load Certificate using new English keys
        $Firma = new FirmaElectronica([
            'file' => $config['certificate_path'],
            'pass' => $config['certificate_password']
        ]);

        // Asegurar formato RUT Emisor con guion para el DTE y la Caratula
        $rutEmisorRaw = preg_replace('/[^0-9Kk]/', '', $config['company_rut']);
        $rutEmisor = substr($rutEmisorRaw, 0, -1) . '-' . substr($rutEmisorRaw, -1);
        $payloadArray['Encabezado']['Emisor']['RUTEmisor'] = $rutEmisor;

        try {
            $dte = new Dte($payloadArray, true); 
        } catch (\Exception $e) {
             throw new \RuntimeException('Error al inicializar DTE: ' . $e->getMessage());
        }

        if (!$dte->timbrar($objetoFolios)) {
            throw new \RuntimeException('Error de timbrado DTE. Verifique el CAF.');
        }

        if (!$dte->firmar($Firma)) {
            throw new \RuntimeException('Error al firmar DTE.');
        }
        
        $envio = new EnvioDte();
        $envio->setFirma($Firma);
        
        // IMPORTANTE: Primero agregar los DTEs, luego la caratula
        $envio->agregar($dte); 

        $caratula = [
            'RutEmisor' => $rutEmisor,
            'RutEnvia' => $Firma->getID(),
            'RutReceptor' => '60803000-K',
            'FchResol' => $config['resolution_date'] ?? '2014-08-22',
            'NroResol' => $config['resolution_number'] ?? '80',
            'TmstFirmaEnv' => date('Y-m-d\TH:i:s'),
        ];
        
        $envio->setCaratula($caratula);
        
        $xmlFirmado = $envio->generar();
        
        // Log del XML para inspección
        file_put_contents(storage_path('logs/last_dte_send.xml'), $xmlFirmado);

        $isProduction = ($config['environment'] === 'production');

        // Obtener Token explícitamente para mayor seguridad en el envío
        $token = Autenticacion::getToken($Firma, $isProduction);
        if (!$token) {
            throw new \RuntimeException('No se pudo obtener el Token de autenticación del SII.');
        }

        // Log del Payload antes de enviar
        Log::info("Enviando DTE al SII (" . ($isProduction ? 'PROD' : 'CERT') . ")", [
            'rut_emisor' => $rutEmisor,
            'tipo_dte' => $payloadArray['Encabezado']['IdDoc']['TipoDTE'] ?? 'N/A'
        ]);

        // Configurar servidor según ambiente (0: Producción, 1: Certificación)
        // maullin es para certificación, palena es para producción
        \sasco\LibreDTE\Sii::setServidor($isProduction ? 'palena' : 'maullin');
        
        // Desactivar verificación SSL temporalmente si estamos en local/Windows para diagnóstico
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            \sasco\LibreDTE\Sii::setVerificarSSL(false);
        }

        $respSii = $envio->enviar($token, $isProduction); 

        // Validar si la respuesta es válida
        if ($respSii === false) {
            Log::error("SII Response FAIL: El servidor del SII no devolvió una respuesta válida (FALSE).");
            throw new \RuntimeException('Error crítico: El servidor del SII no respondió a la solicitud de envío.');
        }

        // Extraer TrackID usando Regex por si viene como string directo o dentro de un objeto/XML
        $respString = is_string($respSii) ? $respSii : json_encode($respSii);
        if (preg_match('/(\d{10,15})/', $respString, $matches)) {
            $track_id = $matches[1];
        } elseif (is_object($respSii) && isset($respSii->track_id)) {
            $track_id = $respSii->track_id;
        } elseif (is_object($respSii) && isset($respSii->status) && !$respSii->status) {
            Log::warning("DTE_SII_REJECTED: " . ($respSii->msg ?? 'Error desconocido'));
            throw new \RuntimeException('SII RECHAZO: ' . ($respSii->msg ?? 'Error desconocido'));
        } else {
            Log::error("SII Response INVALID: Respuesta ilegible del SII.", ['raw' => $respString]);
            throw new \RuntimeException('Error de comunicación: La respuesta del SII tiene un formato inesperado.');
        }
        
        Log::info("DTE_SII_SUCCESS: TrackID " . $track_id);

        return [
            $track_id, 
            $xmlFirmado,
        ];
    }

    public function status(int|string $trackId, array $config = []): array
    {
        try {
            $Firma = new FirmaElectronica([
                'file' => $config['certificate_path'],
                'pass' => $config['certificate_password'] ?? $config['certificate_pass']
            ]);
            
            $isProduction = ($config['environment'] === 'production');
            
            // Forzar servidor según ambiente
            \sasco\LibreDTE\Sii::setServidor($isProduction ? 'maullin' : 'seed');
            
            $token = Autenticacion::getToken($Firma, $isProduction);
            
            if (!$token) {
                return [
                    'estado' => 'FALLO_AUTH',
                    'glosa'  => 'No se pudo obtener el token de autenticación del SII.'
                ];
            }

            $rutEnvia = $Firma->getID(); 
            list($RutEnvia, $DvEnvia) = explode('-', $rutEnvia);

            $xmlRespuesta = \sasco\LibreDTE\Sii::request('QueryEstUp', 'getEstUp', [
                'RutClient' => $RutEnvia,
                'DvClient' => $DvEnvia,
                'TrackId' => (string) $trackId,
                'token' => $token,
            ], $isProduction);

            if ($xmlRespuesta === false || !is_object($xmlRespuesta)) {
                 return [
                    'estado' => 'FALLO_RESPUESTA',
                    'glosa'  => 'El SII no respondió a la consulta o la respuesta no es un XML válido.'
                 ];
            }
            
            // El SII responde con un XML que tiene RECEPCIONDTE/RESP_HDR o directamente los tags
            $estado = (string)($xmlRespuesta->xpath('//ESTADO')[0] ?? 'DESCONOCIDO');
            $glosa = (string)($xmlRespuesta->xpath('//GLOSA')[0] ?? 'Sin detalle');
            
            return [
                'estado' => $estado,
                'glosa'  => $glosa,
                'raw' => (array)$xmlRespuesta
            ];

        } catch (\Exception $e) {
            return [
                'estado' => 'ERROR',
                'glosa'  => $e->getMessage()
            ];
        }
    }
}
