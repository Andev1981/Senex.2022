<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum PaymentMethodEnum: string
{
    use EnumOptions;

    case CASH = 'cash';
    case TRANSFER = 'transfer';
    case WEBPAY = 'webpay';
    case POS_INTEGRADO = 'pos_integrado';

    public function label(): string {
        return match($this) {
            self::CASH => 'Efectivo',
            self::TRANSFER => 'Transferencia',
            self::WEBPAY => 'Webpay (Online)',
            self::POS_INTEGRADO => 'Tarjeta (POS)',
        };
    }

    public function color(): string { return 'emerald'; }
}