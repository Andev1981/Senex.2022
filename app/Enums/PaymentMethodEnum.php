<?php

namespace App\Enums;

enum PaymentMethodEnum: string
{
    case CASH = 'cash'; // Efectivo
    case POS = 'pos_integrado'; // Tarjeta de Crédito (Directa o Transbank genérico)
    case TRANSFER = 'transfer'; // Transferencia Bancaria

        // Si manejas cheques, planes de clínica, etc.
    case CLINIC_PLAN = 'clinic_plan'; // Planes de la clínica (paquetes prepagados)

    /**
     * Devuelve la etiqueta amigable para el frontend.
     */
    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Efectivo (Pago presencial)',
            self::POS => 'Pos (Pago presencial)',
            self::TRANSFER => 'Transferencia Bancaria',
            self::CLINIC_PLAN => 'Plan Clínica',
        };
    }
}
