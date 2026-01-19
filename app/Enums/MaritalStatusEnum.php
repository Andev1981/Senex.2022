<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum MaritalStatusEnum: string
{
    use EnumOptions;

    case SINGLE = 'single';
    case MARRIED = 'married';
    case DIVORCED = 'divorced';
    case WIDOWED = 'widowed';

    public function label(): string {
        return match($this) {
            self::SINGLE => 'Soltero/a',
            self::MARRIED => 'Casado/a',
            self::DIVORCED => 'Divorciado/a',
            self::WIDOWED => 'Viudo/a',
        };
    }

    public function color(): string { return 'gray'; }
}
