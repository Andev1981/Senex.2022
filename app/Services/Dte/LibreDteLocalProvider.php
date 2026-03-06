<?php

namespace App\Services\Dte;

use App\Contracts\DteServiceProvider;
use sasco\LibreDTE\FirmaElectronica;
use sasco\LibreDTE\Sii\EnvioDte;
use sasco\LibreDTE\Sii\Dte;
use sasco\LibreDTE\Sii\Autenticacion;
use sasco\LibreDTE\Sii\Folios;

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
            'pass' => $config['certificate_pass']
        ]);

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
        $envio->agregar($dte); 
        $xmlFirmado = $dte->saveXML();

        // Environment determination
        $isProduction = ($config['environment'] === 'production');

        $respSii = $envio->enviar($isProduction); 
        if (!$respSii->status) {
             throw new \RuntimeException('DTE_SII_ERROR: ' . $respSii->msg);
        }
        
        return [
            $respSii->track_id, 
            $xmlFirmado,
        ];
    }

    public function status(int|string $trackId, array $config = []): array
    {
        try {
            $Firma = new FirmaElectronica([
                'file' => $config['certificate_path'],
                'pass' => $config['certificate_pass']
            ]);
            
            $isProduction = ($config['environment'] === 'production');
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
                    'glosa'  => 'El SII no respondió a la consulta.'
                 ];
            }
            
            $headers = $xmlRespuesta->xpath('/RECEPCIONDTE/RESP_HDR');
            if (empty($headers)) {
                return [
                    'estado' => 'FALLO_SII',
                    'glosa' => 'El SII devolvió una respuesta ilegible.'
                ];
            }

            $respArray = (array)$headers[0];
            
            return [
                'estado' => $respArray['ESTADO'] ?? 'DESCONOCIDO',
                'glosa'  => ($respArray['ERR_CODE'] ?? '0') . ': ' . ($respArray['GLOSA'] ?? 'Sin detalle')
            ];

        } catch (\Exception $e) {
            return [
                'estado' => 'ERROR',
                'glosa'  => $e->getMessage()
            ];
        }
    }
}
