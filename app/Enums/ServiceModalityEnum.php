<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum ServiceModalityEnum: string
{
    use EnumOptions;

    case ONSITE = 'onsite';
    case HOME = 'home';

    public function label(): string
    {
        return match ($this) {
            self::ONSITE => 'En Clínica',
            self::HOME => 'A Domicilio',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::ONSITE => 'building',
            self::HOME => 'home',
        };
    }
}
