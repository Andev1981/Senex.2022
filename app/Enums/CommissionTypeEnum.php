<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum CommissionTypeEnum: string
{
    use EnumOptions;

    case PERCENTAGE = 'percentage';
    case FIXED = 'fixed_amount';

    public function label(): string {
        return match($this) {
            self::PERCENTAGE => 'Porcentual',
            self::FIXED => 'Monto Fijo',
        };
    }

    public function color(): string { return 'purple'; }
}
