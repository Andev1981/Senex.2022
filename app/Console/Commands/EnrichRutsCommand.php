<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Patient;
use App\Services\RutSearchService;
use Illuminate\Support\Facades\Storage;

class EnrichRutsCommand extends Command
{
    protected $signature = 'migration:enrich-ruts {--limit=50 : Cantidad de pacientes a procesar} {--delay=2 : Segundos entre peticiones}';
    protected $description = 'Genera un mapa en storage/app/rut_mapping.json con los nombres de pacientes que requieren RUT real.';

    protected $rutSearchService;

    public function __construct(RutSearchService $rutSearchService)
    {
        parent::__construct();
        $this->rutSearchService = $rutSearchService;
    }

    public function handle()
    {
        $limit = $this->option('limit');
        $delay = $this->option('delay');

        // Buscamos pacientes con RUTs temporales (formato RUT-ID)
        $patients = Patient::where('rut', 'like', '%-%-%')
            ->limit($limit)
            ->get();

        if ($patients->isEmpty()) {
            $this->info("No hay pacientes con RUTs temporales pendientes.");
            return;
        }

        $mappingPath = 'rut_mapping.json';
        $mapping = Storage::exists($mappingPath) 
            ? json_decode(Storage::get($mappingPath), true) 
            : [];

        $this->info("Procesando " . $patients->count() . " registros...");

        foreach ($patients as $patient) {
            $fullName = trim($patient->name . ' ' . $patient->last_name);
            
            // Si ya existe en el mapa y tiene un RUT real, no lo sobreescribimos
            if (isset($mapping[$patient->rut]) && !empty($mapping[$patient->rut]['real_rut'])) {
                continue;
            }

            $this->comment("Analizando: {$fullName} ({$patient->rut})");

            // Intentamos buscar (opcional, por si algún proveedor responde)
            $results = $this->rutSearchService->searchByName($fullName);
            $foundRut = !empty($results) ? str_replace('.', '', $results[0]['rut']) : null;

            // Guardamos con estructura descriptiva para edición manual
            $mapping[$patient->rut] = [
                'name' => $fullName,
                'real_rut' => $foundRut, // Aquí pondrás el RUT manualmente si está en null
                'updated_at' => now()->toDateTimeString()
            ];

            // Guardar progreso
            Storage::put($mappingPath, json_encode($mapping, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            if ($foundRut) {
                $this->info(" -> Sugerencia encontrada: {$foundRut}");
            }

            if ($patients->count() > 1 && $delay > 0) {
                sleep($delay);
            }
        }

        $this->info("¡Listo! Revisa y edita el archivo en: storage/app/{$mappingPath}");
    }
}
