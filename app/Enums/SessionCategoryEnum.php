<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum SessionCategoryEnum: string
{
    use EnumOptions;

    case KINESIOLOGY = 'kinesiology';
    case EVALUATION = 'evaluation';
    case PROCEDURE = 'procedure';
    case MASSAGE = 'massage';
    case OTHER = 'other';

    public function label(): string {
        return match($this) {
            self::KINESIOLOGY => 'Kinesiología',
            self::EVALUATION => 'Evaluación',
            self::PROCEDURE => 'Procedimiento',
            self::MASSAGE => 'Masaje',
            self::OTHER => 'Otro',
        };
    }

    public function color(): string { return 'indigo'; }
}
