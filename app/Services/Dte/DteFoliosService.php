<?php

namespace App\Services\Dte;

use App\Models\AuthorizedFolio;
use sasco\LibreDTE\Sii\Folios;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DteFoliosService
{
    /**
     * Procesa y guarda un archivo CAF en la base de datos.
     */
    public function cargarCAF(int $companyId, string $xmlContent, string $environment = 'certification'): int
    {
        try {
            $folios = new Folios($xmlContent);
            $tipoDTE = $folios->getTipo();
            $rutEmisor = $folios->getEmisor();

            if (!$tipoDTE || !$rutEmisor) {
                throw new \Exception("CAF no válido o faltan datos esenciales (TipoDTE/RutEmisor).");
            }

            // Guardar usando el Modelo para aprovechar Mutators/Traits si existen
            AuthorizedFolio::create([
                'company_id'         => $companyId,
                'rut_emisor'         => $rutEmisor,
                'tipo_dte'           => $tipoDTE,
                'environment'        => $environment,
                'folio_desde'        => $folios->getDesde(),
                'folio_hasta'        => $folios->getHasta(),
                'ultimo_folio_usado' => $folios->getDesde() - 1,
                'caf_xml'            => $xmlContent,
                'fecha_vencimiento'  => $folios->getFechaVencimiento(),
                'activo'             => true,
            ]);

            Log::info("CAF cargado exitosamente para Empresa #$companyId, Tipo DTE: $tipoDTE, Ambiente: $environment");
            return $tipoDTE;
        } catch (\Exception $e) {
            throw new \Exception("Fallo al procesar o guardar el archivo CAF: " . $e->getMessage());
        }
    }

    /**
     * Reserva el siguiente folio disponible.
     */
    public function reservarFolio(int $companyId, int $tipoDte, string $environment = 'certification'): int
    {
        $folioReservado = null;

        DB::transaction(function () use ($companyId, $tipoDte, $environment, &$folioReservado) {
            // Buscar el rango de folios activo para este DTE, Ambiente y Empresa
            $registroFolio = DB::table('authorized_folios')
                ->where('company_id', $companyId)
                ->where('tipo_dte', $tipoDte)
                ->where('environment', $environment)
                ->where('activo', true)
                ->whereColumn('ultimo_folio_usado', '<', 'folio_hasta')
                ->orderBy('folio_desde', 'asc') // Consumir primero el rango más antiguo
                ->lockForUpdate()
                ->first();

            if (!$registroFolio) {
                throw new \Exception("No hay folios disponibles para Empresa #$companyId, DTE: $tipoDte, Ambiente: $environment.");
            }

            $siguienteFolio = $registroFolio->ultimo_folio_usado + 1;

            DB::table('authorized_folios')
                ->where('id', $registroFolio->id)
                ->update([
                    'ultimo_folio_usado' => $siguienteFolio,
                    'updated_at' => now()
                ]);

            $folioReservado = $siguienteFolio;
        });

        if (is_null($folioReservado)) {
            throw new \Exception("Error crítico en la reserva de folio.");
        }

        return $folioReservado;
    }

    /**
     * Recupera el objeto Folios (CAF) activo sin incrementar el contador.
     */
    public function recuperarCAF(int $companyId, int $tipoDTE, string $environment = 'certification'): Folios
    {
        $registro = AuthorizedFolio::where('company_id', $companyId)
            ->where('tipo_dte', $tipoDTE)
            ->where('environment', $environment)
            ->where('activo', true)
            ->whereColumn('ultimo_folio_usado', '<', 'folio_hasta')
            ->orderBy('folio_desde', 'asc')
            ->first();

        if (!$registro) {
            throw new \Exception("No se encontró un CAF activo para el tipo: $tipoDTE en ambiente: $environment");
        }

        return new Folios($registro->caf_xml);
    }

    /**
     * Genera un objeto Folios simulado (Solo para desarrollo).
     */
    public function getSimulatedFolio(int $tipo): array
    {
        $dummyCaf = <<<XML
<?xml version="1.0"?>
<AUTORIZACION>
  <CAF version="1.0">
    <DA>
      <RE>1-9</RE>
      <RS>EMPRESA SIMULADA</RS>
      <TD>{$tipo}</TD>
      <RNG><D>1</D><H>999999</H></RNG>
      <FA>2050-12-31</FA>
      <RSAPK><M>0</M><E>0</E></RSAPK>
      <IDK>0</IDK>
    </DA>
    <FRMA algoritmo="SHA1withRSA">SIMULATED_SIGNATURE</FRMA>
  </CAF>
</AUTORIZACION>
XML;
        
        return [new Folios($dummyCaf), rand(1, 999999)];
    }
}
