<?php

namespace App\Services\Dte;

use App\Contracts\DteServiceProvider; 
use App\Models\Invoice; 
use App\Models\Dte;     
use App\Models\DteConfiguration;
use App\Enums\DteStatusEnum;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Exception;

class DteService
{
    public function __construct(
        protected DteServiceProvider $dteProvider,
        protected DteFoliosService $foliosService,
        protected LibreDtePayloadMapper $payloadMapper,
        protected DteCalculatorService $calculatorService
    ) {}

    /**
     * Proceso principal de emisión de un DTE basado en una Factura/Boleta local.
     */
    public function issueInvoiceDte(Invoice $invoice): ?string
    {
        Log::info("--- [DTE] INICIO EMISIÓN ID #{$invoice->id} ---");

        try {
            // Sincronizar totales y corregir tipo (Afecto/Exento) según ítems reales
            $this->calculatorService->calculateAndDetermineType($invoice);

            $config = $this->getCompanyConfig($invoice->company_id);
            $environment = $config['environment']; 
            $tipoDte = (int)$invoice->dte_type;

            Log::info("[DTE] Contexto: Tipo $tipoDte | Ambiente $environment | Receptor: " . ($invoice->metadata['client']['rut'] ?? 'Anónimo'));

            // 1. Obtener/Reutilizar Folio (CAF)
            $folioAUsar = $invoice->dte_folio;
            if (!$folioAUsar) {
                $folioAUsar = $this->foliosService->reservarFolio((int)$invoice->company_id, (int)$tipoDte, $environment);
                $invoice->dte_folio = $folioAUsar;
                $invoice->save();
                Log::info("[DTE] Folio Nuevo Reservado: $folioAUsar");
            } else {
                Log::info("[DTE] Reutilizando Folio Existente: $folioAUsar");
            }

            if (!$folioAUsar) {
                throw new Exception("Sin folios (CAF) disponibles para Tipo $tipoDte.");
            }

            // 2. Recuperar Objeto CAF para firma técnica
            $objetoFolios = $this->foliosService->recuperarCAF((int)$invoice->company_id, (int)$tipoDte, $environment);
            if (!$objetoFolios) {
                throw new Exception("No se pudo cargar el archivo CAF para el folio $folioAUsar.");
            }

            // 3. Generar Payload (Mapeo a estándar LibreDTE)
            $payloadArray = $this->payloadMapper->mapInvoiceToPayload($invoice, $config, $tipoDte);
            Log::debug("[DTE] Payload Generado: " . json_encode($payloadArray));

            // 4. Emitir (Bypass si es modo entrenamiento)
            if (!empty($config['simulation_mode']) && $config['simulation_mode'] === true) {
                Log::info("[DTE] EMISIÓN SIMULADA (Offline)");
                $trackId = "SIM-" . strtoupper(Str::random(8));
                $xmlFirmado = "<!-- Simulado por Sistema -->";
            } else {
                Log::info("[DTE] Enviando a LibreDTE/SII...");
                $result = $this->dteProvider->issue($payloadArray, $config, $objetoFolios);
                list($trackId, $xmlFirmado) = $result;
                Log::info("[DTE] SII Aceptó Envío. TrackID: $trackId");
            }

            // 5. Guardar Registro Final
            $this->guardarRegistroDte($invoice, $tipoDte, $folioAUsar, $trackId, $xmlFirmado);
            
            $invoice->dte_status = DteStatusEnum::SENT;
            $invoice->save();

            Log::info("--- [DTE] FIN PROCESO ID #{$invoice->id} (EXITO) ---");
            return $trackId;

        } catch (Exception $e) {
            Log::error("[DTE] ERROR CRÍTICO ID #{$invoice->id}: " . $e->getMessage());
            $invoice->update([
                'dte_status' => DteStatusEnum::RETRY,
                'dte_notes'  => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene la configuración DTE de la empresa y la formatea para el proveedor.
     */
    protected function getCompanyConfig(int $companyId): array
    {
        $config = DteConfiguration::where('company_id', $companyId)->first();

        if (!$config || !$config->certificate_path) {
            throw new Exception("La empresa no tiene configurado su certificado digital.");
        }

        return [
            'company_rut'          => $config->company_rut,
            'certificate_path'     => Storage::disk('private')->path($config->certificate_path),
            'certificate_password' => Crypt::decryptString($config->certificate_password),
            'environment'          => $config->environment, // 'certification' o 'production'
            'simulation_mode'      => (bool)$config->simulation_mode,
            'acteco'              => $config->acteco ?? 620100, // Valor por defecto para servicios médicos
        ];
    }

    /**
     * Guarda o actualiza el registro final del DTE en la tabla 'dtes'.
     */
    protected function guardarRegistroDte(Invoice $invoice, int $tipo, int $folio, string $trackId, string $xmlFirmado): Dte
    {
        $receptorRut = data_get($invoice->metadata, 'client.rut') ?? '66666666-6';

        return Dte::updateOrCreate(
            [
                'company_id' => $invoice->company_id,
                'type' => $tipo,
                'folio' => $folio
            ],
            [
                'branch_id' => $invoice->branch_id,
                'rut_emisor' => $invoice->company->rut ?? '76000000-1',
                'rut_receptor' => $receptorRut,
                'amount_total_clp' => $invoice->total_amount_clp,
                'xml_data' => $xmlFirmado,
                'track_id' => $trackId,
                'estado_sii' => 'ENVIADO',
                'origin_type' => 'Invoice',
                'origin_id' => $invoice->id
            ]
        );
    }

    /**
     * Marca las sesiones asociadas a la factura como 'facturadas'.
     */
    protected function markAssociatedSessionsAsDte(Invoice $invoice): void
    {
        // Esta lógica se activa si la factura tiene ítems que son sesiones médicas
        $sessionIds = $invoice->items()
            ->where('sellable_type', 'TreatmentSession')
            ->pluck('sellable_id');

        if ($sessionIds->isNotEmpty()) {
            \App\Models\TreatmentSession::whereIn('id', $sessionIds)
                ->update(['is_billed' => true]);
        }
    }
}
