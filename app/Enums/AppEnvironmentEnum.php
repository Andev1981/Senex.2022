<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum AppEnvironmentEnum: string
{
    use EnumOptions;

    case HOMOLOGACION = 'homologacion';
    case PRODUCCION = 'produccion';

    public function label(): string {
        return match($this) {
            self::HOMOLOGACION => 'Certificación / Prueba',
            self::PRODUCCION => 'Producción (Real)',
        };
    }

    public function color(): string { return 'gray'; }
}
