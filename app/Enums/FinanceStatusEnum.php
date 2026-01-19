<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum FinanceStatusEnum: string
{
    use EnumOptions;

    case UNPAID = 'unpaid';
    case PARTIAL = 'partial';
    case PAID = 'paid';
    case VOIDED = 'voided';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::UNPAID => 'Pendiente',
            self::PARTIAL => 'Abonado',
            self::PAID => 'Pagado',
            self::VOIDED => 'Anulada',
            self::REFUNDED => 'Reembolsado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::UNPAID => 'red',
            self::PARTIAL => 'orange',
            self::PAID => 'green',
            self::VOIDED => 'gray',
            self::REFUNDED => 'purple',
        };
    }
}
