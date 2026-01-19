<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum TreatmentPhaseEnum: string
{
    use EnumOptions;

    case EVALUATION = 'evaluation';
    case ACUTE_SYMPTOMATIC = 'acute_symptomatic';
    case FUNCTIONAL_RESTORATION = 'functional_restoration';
    case DISCHARGE = 'discharge';

    public function label(): string {
        return match($this) {
            self::EVALUATION => 'Evaluación Inicial',
            self::ACUTE_SYMPTOMATIC => 'Fase Aguda/Sintomática',
            self::FUNCTIONAL_RESTORATION => 'Restauración Funcional',
            self::DISCHARGE => 'Alta Médica',
        };
    }

    public function color(): string { return 'blue'; }
}
