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

        $rows = $this->loadFromGovApi();


        if (empty($rows)) {
            $this->command->error('No se pudieron cargar comunas (sin dataset local ni API disponible).');
            return;
        }

        // Normalizador
        $norm = static function ($s): string {
            $s = (string) $s;
            $s = preg_replace('/\s+/u', ' ', $s ?? '');
            $s = trim($s);
            $s = Str::lower($s);
            $s = Str::ascii($s);
            $s = preg_replace('/\bprovincia(?:\s+de)?\s+/u', '', $s);
            return (string) $s;
        };

        // Helper para aliases
        $pick = static function (array $row, array $keys, $default = null) {
            foreach ($keys as $k) {
                if (array_key_exists($k, $row) && $row[$k] !== null && $row[$k] !== '') {
                    return $row[$k];
                }
            }
            return $default;
        };

        // Índices de provincias
        $provinces = Province::query()->get(['id', 'name', 'code']);
        $provByName = [];
        $provByCode = [];
        foreach ($provinces as $p) {
            $key = $norm($p->name);
            if ($key !== '' && !array_key_exists($key, $provByName)) {
                $provByName[$key] = (int) $p->id;
            }
            if (isset($p->code) && $p->code !== '' && !array_key_exists((string)$p->code, $provByCode)) {
                $provByCode[(string)$p->code] = (int) $p->id;
            }
        }

        // Si la DB no tiene code en provincias pero el dataset trae códigos, armar mapa desde API
        $needsProvCodeLookup = empty($provByCode) && $this->datasetHasAny($rows, ['province_code', 'codigo_provincia', 'codigo_padre']);

        $govProvCodeToName = [];
        if ($needsProvCodeLookup) {
            $govProv = $this->firstOkJson(['https://apis.digital.gob.cl/dpa/provincias']);
            if (is_array($govProv)) {
                foreach ($govProv as $p) {
                    if (isset($p['codigo'], $p['nombre'])) {
                        $govProvCodeToName[(string)$p['codigo']] = (string)$p['nombre'];
                    }
                }
            }
        }

        $created = 0;
        $updated = 0;
        $skipReasons = ['missing_name' => 0, 'missing_province' => 0, 'prov_not_found' => 0];
        $skipSamples = ['missing_name' => [], 'missing_province' => [], 'prov_not_found' => []];

        foreach ($rows as $r) {
            // Aliases de campos
            $name = trim((string)($pick($r, ['name', 'nombre', 'comuna'], '')));
            $provinceIdRaw = $pick($r, ['province_id']);
            $provinceName  = $pick($r, ['province', 'provincia']);
            $provinceCode  = $pick($r, ['province_code', 'codigo_provincia', 'codigo_padre']); // <-- aquí
            $code          = $pick($r, ['code', 'codigo', 'ine_code']);
            $lat           = $pick($r, ['lat', 'latitud']);
            $lng           = $pick($r, ['lng', 'longitud']);

            if ($name === '') {
                $skipReasons['missing_name']++;
                if (count($skipSamples['missing_name']) < 5) $skipSamples['missing_name'][] = $r;
                continue;
            }

            // Resolver province_id
            $provinceId = null;

            if ($provinceIdRaw !== null && (int)$provinceIdRaw > 0) {
                $provinceId = (int) $provinceIdRaw;
            }

            if (!$provinceId && $provinceName) {
                $provinceId = $provByName[$norm($provinceName)] ?? null;
            }

            if (!$provinceId && $provinceCode) {
                if (!empty($provByCode)) {
                    $provinceId = $provByCode[(string)$provinceCode] ?? null;
                } else {
                    $pName = $govProvCodeToName[(string)$provinceCode] ?? null;
                    if ($pName) {
                        $provinceId = $provByName[$norm($pName)] ?? null;
                    }
                }
            }

            if (!$provinceId && !$provinceName && !$provinceCode && !$provinceIdRaw) {
                $skipReasons['missing_province']++;
                if (count($skipSamples['missing_province']) < 5) $skipSamples['missing_province'][] = ['name' => $name] + $r;
                continue;
            }

            if (!$provinceId) {
                $skipReasons['prov_not_found']++;
                if (count($skipSamples['prov_not_found']) < 5) {
                    $skipSamples['prov_not_found'][] = [
                        'name' => $name,
                        'province' => $provinceName,
                        'province_code' => $provinceCode,
                        'province_id_raw' => $provinceIdRaw,
                    ];
                }
                continue;
            }

            // ID
            $idRaw = $pick($r, ['id']);
            $id = isset($idRaw) && (int)$idRaw > 0
                ? (int)$idRaw
                : $this->deterministicId($name, (string)$provinceId);

            $code = isset($code) && $code !== '' ? (string)$code : null;

            $payload = [
                'id'          => $id,
                'province_id' => (int)$provinceId,
                'code'        => $code ?? (string)$id,
                'name'        => $name,
                'lat'         => isset($lat) ? (float)$lat : null,
                'lng'         => isset($lng) ? (float)$lng : null,
            ];

            $existing = Commune::find($id);
            if (!$existing && $payload['code']) {
                $existing = Commune::where('code', $payload['code'])->first();
            }

            if ($existing) {
                $existing->update(Arr::except($payload, ['id']));
                $updated++;
            } else {
                Commune::create($payload);
                $created++;
            }
        }

        $skipped = array_sum($skipReasons);
        $this->command->info("Comunas: creadas {$created}, actualizadas {$updated}, omitidas {$skipped}.");

        if ($skipped > 0) {
            $this->command->warn('Detalle de omisiones: ' . json_encode($skipReasons, JSON_UNESCAPED_UNICODE));

            $printSample = function (string $title, array $rows) {
                if (empty($rows)) return;
                echo PHP_EOL . "Ejemplos {$title} (máx 5):" . PHP_EOL;
                foreach ($rows as $i => $row) {
                    echo '  - ' . ($i + 1) . ') ' . json_encode($row, JSON_UNESCAPED_UNICODE) . PHP_EOL;
                }
            };

            $printSample('missing_name', $skipSamples['missing_name']);
            $printSample('missing_province', $skipSamples['missing_province']);
            $printSample('prov_not_found', $skipSamples['prov_not_found']);
        }
    }



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
                'id'       => $code !== '' ? (int)$code : null,
                'code'     => $code !== '' ? $code : null,
                'name'     => $name,
                'province' => $provinceName,
                'province_code' => $pcode ?: null,
            ];
        }

        $this->command->info('Comunas descargadas desde API DPA (Gobierno).');
        return $rows;
    }

    protected function firstOkJson(array $urls): ?array
    {
        foreach ($urls as $u) {
            try {
                $resp = Http::timeout(20)
                    ->withOptions(['verify' => false]) // 🚨 Desactiva verificación SSL
                    ->get($u);
                if ($resp->ok()) {
                    $json = $resp->json();
                    if (is_array($json) && !empty($json)) {
                        return $json;
                    }
                } else {
                    $this->command->warn("HTTP {$resp->status()} al llamar {$u}");
                }
            } catch (\Throwable $e) {
                $this->command->error("Error al llamar {$u}: " . $e->getMessage());
            }
        }
        return null;
    }


    protected function datasetHasAny(array $rows, array $keys): bool
    {
        foreach ($rows as $r) {
            foreach ($keys as $k) {
                if (array_key_exists($k, $r)) return true;
            }
        }
        return false;
    }

    protected function deterministicId(string $name, string $provinceId): int
    {
        $base = Str::ascii(Str::lower(trim($name . '|' . $provinceId)));
        $h = crc32($base);
        $n = $h & 0x7fffffff;
        return $n === 0 ? 1 : $n;
    }
}
