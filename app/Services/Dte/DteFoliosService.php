<?php

namespace App\Services\Dte;

use sasco\LibreDTE\Sii\Folios;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // Usaremos la Facade DB

class DteFoliosService
{
    // Ya no es necesario almacenar el objeto Folios en memoria, la DB es la fuente de verdad.
    // private $foliosPorTipo = []; 

    public function cargarCAF(string $rutaArchivoCAF)
    {
        // 1. Validaciones y carga del XML (igual que antes)
        if (!file_exists($rutaArchivoCAF)) {
            throw new \Exception("Archivo CAF no encontrado en: " . $rutaArchivoCAF);
        }
        $xmlData = file_get_contents($rutaArchivoCAF);

        try {
            $folios = new Folios($xmlData);
            $tipoDTE = $folios->getTipo();
            $rutEmisor = $folios->getEmisor(); // Se asume que el método getEmisor() existe

            if (!$tipoDTE || !$rutEmisor) {
                throw new \Exception("CAF no válido o faltan datos esenciales (TipoDTE/RutEmisor).");
            }

            // 2. Insertar en la Base de Datos
            DB::table('dte_folios')->insert([
                'rut_emisor' => $rutEmisor,
                'tipo_dte' => $tipoDTE,
                'folio_desde' => $folios->getDesde(),
                'folio_hasta' => $folios->getHasta(),
                // Al inicio, el último folio usado es 1 menos que el primero.
                'ultimo_folio_usado' => $folios->getDesde() - 1,
                'caf_xml' => $xmlData,
                'fecha_vencimiento' => $folios->getFechaVencimiento(),
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("CAF cargado exitosamente en DB para Tipo DTE: " . $tipoDTE);
            return $tipoDTE;
        } catch (\Exception $e) {
            throw new \Exception("Fallo al procesar o guardar el archivo CAF: " . $e->getMessage());
        }
    }

    /**
     * Reserva el siguiente folio disponible y devuelve el objeto Folios del core.
     * @param string $rutEmisor Rut del emisor.
     * @param int $tipoDTE Código del DTE (ej. 33).
     * @return array [Folios $objetoFolios, int $folioReservado]
     * @throws \Exception si no hay folios disponibles.
     */
    public function reservarFolio(int $company, string $rutEmisor, int $tipoDTE): array
    {
        $folioReservado = null;
        $cafData = null;

        // 1. Usar transacción y LOCK FOR UPDATE para garantizar atomicidad
        DB::transaction(function () use ($company, $rutEmisor, $tipoDTE, &$folioReservado, &$cafData) {
            // Normalizar RUT emisor que viene del controlador (quitar todo lo que no sea número)
            $rutLimpio = preg_replace('/[^0-9]/', '', $rutEmisor);

            // A. Buscar el rango de folios activo para este DTE y bloquearlo
            // Usamos REPLACE en la base de datos para comparar manzanas con manzanas
            $registroFolio = DB::table('authorized_folios')
                ->where('company_id', $company)
                ->where('tipo_dte', $tipoDTE)
                ->where('activo', true)
                ->whereColumn('ultimo_folio_usado', '<', 'folio_hasta')
                ->where(function($query) use ($rutLimpio) {
                    $query->where(DB::raw("REGEXP_REPLACE(rut_emisor, '[^0-9]', '')"), $rutLimpio);
                })
                ->lockForUpdate()
                ->first();

            if (!$registroFolio) {
                throw new \Exception("No se encontró un rango de folios activo para RUT: $rutEmisor, Tipo DTE: $tipoDTE.");
            }

            // B. Calcular y validar el siguiente folio
            $siguienteFolio = $registroFolio->ultimo_folio_usado + 1;

            if ($siguienteFolio > $registroFolio->folio_hasta) {
                throw new \Exception("Folios agotados para Tipo DTE: $tipoDTE. Último folio: $registroFolio->folio_hasta");
            }

            // C. Reservar el folio: Actualizar el contador en la DB
            DB::table('authorized_folios')
                ->where('id', $registroFolio->id)
                ->update(['ultimo_folio_usado' => $siguienteFolio]);

            // D. Asignar datos para el retorno
            $folioReservado = $siguienteFolio;
            $cafData = $registroFolio->caf_xml;
        }); // ⬅️ La transacción se cierra y libera el bloqueo

        // 2. Crear el objeto Folios fuera de la transacción (uso de CPU)
        if (is_null($cafData)) {
            // Este caso solo ocurre si el lock falla, pero lo manejamos como fallback
            throw new \Exception("Error desconocido en la reserva de folio.");
        }
        $objetoFolios = new Folios($cafData);

        // 3. Devolver los resultados
        return [$objetoFolios, $folioReservado];
    }

    /**
     * Recupera el objeto Folios (CAF) para un tipo de DTE sin incrementar nada.
     */
    public function recuperarCAF(int $company, int $tipoDTE): Folios
    {
        $registro = DB::table('authorized_folios')
            ->where('company_id', $company)
            ->where('tipo_dte', $tipoDTE)
            ->where('activo', true)
            ->first();

        if (!$registro) {
            throw new \Exception("No se encontró un CAF activo para el tipo: $tipoDTE");
        }

        return new Folios($registro->caf_xml);
    }

    /**
     * Genera un objeto Folios simulado y un número aleatorio.
     */
    public function getSimulatedFolio(int $tipo): array
    {
        // XML CAF Dummy minímo para que LibreDTE no falle al instanciar class Folios
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
        
        // Retornar objeto Folios y número aleatorio
        return [new Folios($dummyCaf), rand(500000, 999999)];
    }
}
