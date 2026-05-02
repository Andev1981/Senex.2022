<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum AppointmentStatusEnum: string
{
    use EnumOptions;

    case SCHEDULED = 'scheduled';
    case CONFIRMED = 'confirmed';
    case CHECKED_IN = 'checked_in';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case NO_SHOW = 'not_show'; // O 'absent'

    public function label(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Programada',
            self::CONFIRMED => 'Confirmada',
            self::CHECKED_IN => 'Llegó (En espera)',
            self::IN_PROGRESS => 'En Box',
            self::COMPLETED => 'Realizada',
            self::CANCELLED => 'Anulada',
            self::NO_SHOW => 'No Asistió',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::SCHEDULED => 'blue',      //bg-blue-100 text-blue-800
            self::CONFIRMED => 'indigo',
            self::CHECKED_IN => 'orange',
            self::IN_PROGRESS => 'amber',   //bg-amber-100
            self::COMPLETED => 'green',
            self::CANCELLED => 'red',
            self::NO_SHOW => 'gray',
        };
    }
}
