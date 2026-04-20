<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum AppEnvironmentEnum: string
{
    use EnumOptions;

    case CERTIFICATION = 'certification';
    case PRODUCTION = 'production';

    public function label(): string {
        return match($this) {
            self::CERTIFICATION => 'Certificación / Pruebas',
            self::PRODUCTION => 'Producción Real',
        };
    }

    public function color(): string {
        return match($this) {
            self::CERTIFICATION => 'amber',
            self::PRODUCTION => 'green',
        };
    }
}
