<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum ServiceModalityEnum: string
{
    use EnumOptions;

    case ONSITE = 'onsite';
    case HOME = 'home';
    case ONLINE = 'online';

    public function label(): string
    {
        return match ($this) {
            self::ONSITE => 'En Clínica',
            self::HOME => 'A Domicilio',
            self::ONLINE => 'Online / Telemedicina',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::ONSITE => 'building',
            self::HOME => 'home',
            self::ONLINE => 'video',
        };
    }
}
