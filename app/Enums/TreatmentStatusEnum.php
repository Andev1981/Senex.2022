<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum TreatmentStatusEnum: string
{
    use EnumOptions;

    case EVALUATION = 'evaluation';
    case IN_PROGRESS = 'in_progress';
    case PAUSED = 'paused';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case INTERRUPTED = 'interrupted';

    public function label(): string {
        return match($this) {
            self::EVALUATION => 'En Evaluación',
            self::IN_PROGRESS => 'En Curso',
            self::PAUSED => 'Pausado',
            self::COMPLETED => 'Finalizado',
            self::CANCELLED => 'Cancelado',
            self::INTERRUPTED => 'Interrumpido',
        };
    }

    public function color(): string {
        return match($this) {
            self::IN_PROGRESS => 'green',
            self::EVALUATION => 'blue',
            self::PAUSED => 'orange',
            default => 'gray',
        };
    }
}
