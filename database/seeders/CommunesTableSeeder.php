<?php

namespace Database\Seeders;

use App\Models\Commune;
use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CommunesTableSeeder extends Seeder
{
    public function run(): void
    {
        $rows = $this->loadFromLocal();
        if (empty($rows)) {
            $rows = $this->loadFromGovApi();
        }

        if (empty($rows)) {
            $this->command->error('No se pudieron cargar comunas (sin dataset local ni API disponible).');
            return;
        }

        // Normalizador de nombres (siempre retorna string)
        $norm = static function ($s): string {
            $s = (string) $s;                           // fuerza string
            $s = preg_replace('/\s+/u', ' ', $s ?? ''); // squish
            $s = trim($s);
            $s = Str::lower($s);
            $s = Str::ascii($s);
            return (string) $s;                         // asegurar string plano
        };

        // Índice de provincias por nombre normalizado
        $provinces = Province::query()->get(['id', 'name']);
        $provIndex = [];
        foreach ($provinces as $p) {
            $key = $norm($p->name);
            if ($key === '') {
                // evita llave vacía accidental
                $this->command->warn("Provincia con nombre vacío (id={$p->id}), saltando del índice.");
                continue;
            }
            // si hay duplicados tras normalizar, conserva el primero
            if (!array_key_exists($key, $provIndex)) {
                $provIndex[$key] = (int) $p->id;
            }
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($rows as $r) {
            // Se espera: ['id'?, 'province' (nombre) o 'province_id'?, 'code'?, 'name', 'lat'?, 'lng'?]
            $name = trim((string)($r['name'] ?? ''));
            $provinceName = $r['province'] ?? null;

            if ($name === '' || (!$provinceName && empty($r['province_id']))) {
                $skipped++;
                continue;
            }

            $provinceId = $r['province_id'] ?? ($provIndex[$norm($provinceName)] ?? null);
            if (!$provinceId) {
                $this->command->warn("Saltando comuna '{$name}': no se encontró provincia '{$provinceName}'.");
                $skipped++;
                continue;
            }

            // Si no viene id oficial, generamos uno determinístico a partir del nombre+provincia
            $id = isset($r['id']) && (int)$r['id'] > 0
                ? (int)$r['id']
                : $this->deterministicId($name, (string)$provinceId);

            $payload = [
                'id'          => $id,
                'province_id' => (int)$provinceId,
                'code'        => (string)($r['code'] ?? $id), // si no viene code, usamos el id
                'name'        => $name,
                'lat'         => isset($r['lat']) ? (float)$r['lat'] : null,
                'lng'         => isset($r['lng']) ? (float)$r['lng'] : null,
            ];

            $existing = Commune::find($id);
            if ($existing) {
                $existing->update(Arr::except($payload, ['id']));
                $updated++;
            } else {
                Commune::create($payload);
                $created++;
            }
        }

        $this->command->info("Comunas: creadas {$created}, actualizadas {$updated}, omitidas {$skipped}.");
    }

    /**
     * Intenta cargar desde dataset local: database/seeders/data/communes.php
     * Estructura esperada: array de filas con (name, province ó province_id, code?, id?, lat?, lng?)
     */
    protected function loadFromLocal(): array
    {
        $path = database_path('seeders/data/communes.php');
        if (File::exists($path)) {
            $data = include $path;
            if (is_array($data) && !empty($data)) {
                $this->command->info('Cargando comunas desde dataset local.');
                return $data;
            }
        }
        return [];
    }

    /**
     * Carga desde API DPA (Gobierno). Combina comunas + provincias para mapear por nombre.
     * Documentación: https://apis.digital.gob.cl/dpa
     */
    protected function loadFromGovApi(): array
    {
        $this->command->warn('Intentando descargar comunas desde API DPA (Gobierno)...');

        $provApis = [
            'https://apis.digital.gob.cl/dpa/provincias',
        ];
        $comApis = [
            'https://apis.digital.gob.cl/dpa/comunas?geolocation=false',
        ];

        $provinces = $this->firstOkJson($provApis);
        $communes  = $this->firstOkJson($comApis);

        if (!$provinces || !$communes) {
            $this->command->warn('No fue posible obtener provincias o comunas desde la API.');
            return [];
        }

        // Índice provinciaCodigo -> nombreProvincia
        $provByCode = [];
        foreach ($provinces as $p) {
            if (!isset($p['codigo'], $p['nombre'])) continue;
            $provByCode[(string)$p['codigo']] = (string)$p['nombre'];
        }

        $rows = [];
        foreach ($communes as $c) {
            if (!isset($c['nombre'])) continue;
            $name  = (string)$c['nombre'];
            $code  = (string)($c['codigo'] ?? '');
            $pcode = (string)($c['codigo_padre'] ?? '');

            $provinceName = $provByCode[$pcode] ?? null;
            $rows[] = [
                'id'       => $code !== '' ? (int)$code : null, // si el código es numérico, úsalo como id
                'code'     => $code !== '' ? $code : null,
                'name'     => $name,
                'province' => $provinceName, // lo mapearemos por nombre a tu tabla
            ];
        }

        $this->command->info('Comunas descargadas desde API DPA (Gobierno).');
        return $rows;
    }

    protected function firstOkJson(array $urls): ?array
    {
        foreach ($urls as $u) {
            try {
                $resp = Http::timeout(20)->get($u);
                if ($resp->ok()) {
                    $json = $resp->json();
                    if (is_array($json) && !empty($json)) return $json;
                }
            } catch (\Throwable $e) {
                // continuar con la siguiente URL
            }
        }
        return null;
    }

    /**
     * Genera un ID estable (entero positivo) desde (nombre + provinceId)
     */
    protected function deterministicId(string $name, string $provinceId): int
    {
        return abs(crc32(Str::ascii(Str::lower(trim($name . '|' . $provinceId))))) ?: random_int(100000, 999999);
    }
}
