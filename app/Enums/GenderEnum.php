<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum GenderEnum: string
{
    use EnumOptions;

    case MALE = 'male';
    case FEMALE = 'female';
    case OTHER = 'other';

    public function label(): string {
        return match($this) {
            self::MALE => 'Masculino',
            self::FEMALE => 'Femenino',
            self::OTHER => 'Otro',
        };
    }

    public function color(): string { return 'gray'; }
}
