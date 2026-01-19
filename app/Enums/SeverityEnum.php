<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum SeverityEnum: string
{
    use EnumOptions;

    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';
    case CRITICAL = 'critical';

    public function label(): string {
        return match($this) {
            self::LOW => 'Leve',
            self::MEDIUM => 'Moderada',
            self::HIGH => 'Grave',
            self::CRITICAL => 'Crítica',
        };
    }

    public function color(): string {
        return match($this) {
            self::LOW => 'blue',
            self::MEDIUM => 'orange',
            self::HIGH => 'red',
            self::CRITICAL => 'rose',
        };
    }
}
