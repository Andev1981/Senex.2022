<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RutSearchService
{
    /**
     * Busca personas por nombre intentando varios proveedores públicos.
     */
    public function searchByName(string $name): array
    {
        $term = trim($name);
        
        if (strlen($term) < 5) {
            return [];
        }

        // Intento 1: NombreRutyFirma
        $results = $this->tryNombreRutYFirma($term);
        if (!empty($results)) return $results;

        // Intento 2: Genealog
        $results = $this->tryGenealog($term);
        if (!empty($results)) return $results;

        return [];
    }

    private function tryNombreRutYFirma(string $term): array
    {
        try {
            $response = Http::withHeaders($this->getHeaders())
                ->timeout(10)
                ->asForm()
                ->post("https://www.nombrerutyfirma.com/buscar", [
                    'term' => $term
                ]);

            if ($response->successful()) {
                $html = $response->body();
                preg_match_all('/<td>(.*?)<\/td>\s*<td>(\d{1,2}\.\d{3}\.\d{3}-[\dkK])<\/td>/i', $html, $matches, PREG_SET_ORDER);

                $results = [];
                foreach ($matches as $match) {
                    $results[] = [
                        'name' => strip_tags($match[1]),
                        'rut' => $match[2],
                        'source' => 'nombrerutyfirma.com'
                    ];
                }
                return $results;
            }
        } catch (\Exception $e) {
            Log::debug("Fallo NombreRutYFirma: " . $e->getMessage());
        }
        return [];
    }

    private function tryGenealog(string $term): array
    {
        try {
            // Genealog usa GET y es más permisivo con scrapers básicos
            $response = Http::withHeaders($this->getHeaders())
                ->timeout(10)
                ->get("https://www.genealog.cl/Genealogia/buscar.php", [
                    'nombre' => $term
                ]);

            if ($response->successful()) {
                $html = $response->body();
                // Buscamos RUTs en el texto (formato estándar con puntos)
                preg_match_all('/(\d{1,2}\.\d{3}\.\d{3}-[\dkK])/i', $html, $matches);
                
                $results = [];
                $uniqueRuts = array_unique($matches[0] ?? []);
                foreach ($uniqueRuts as $rut) {
                    $results[] = [
                        'name' => $term . " (Coincidencia)",
                        'rut' => $rut,
                        'source' => 'genealog.cl'
                    ];
                }
                return $results;
            }
        } catch (\Exception $e) {
            Log::debug("Fallo Genealog: " . $e->getMessage());
        }
        return [];
    }

    private function getHeaders(): array
    {
        return [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language' => 'es-ES,es;q=0.9',
            'Referer' => 'https://www.google.com/',
        ];
    }
}
