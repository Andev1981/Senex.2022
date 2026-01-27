<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum DteStatusEnum: string
{
    use EnumOptions;

    case PENDING = 'pending';           // Aún no enviado
    case GENERATED = 'created';         // Generado localmente
    case SENT = 'sent';                 // Enviado al SII (Track ID recibido)
    case ACCEPTED = 'accepted';         // Aceptado por el SII
    case ACCEPTED_WITH_OBJECTIONS = 'accepted_with_objections';
    case REJECTED = 'rejected';         // Rechazado por el SII
    case ERROR = 'error';               // Error técnico (timeout, firma, etc)
    case RETRY = 'PENDING_RETRY';       // Reintento pendiente

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Por Emitir',
            self::GENERATED => 'Generando...',
            self::SENT => 'Enviado SII',
            self::ACCEPTED => 'Aceptado',
            self::ACCEPTED_WITH_OBJECTIONS => 'Aceptado c/ Rep',
            self::REJECTED => 'Rechazado',
            self::ERROR => 'Error Técnico',
            self::RETRY => 'Reintento Pendiente',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::GENERATED => 'blue',
            self::SENT => 'amber',
            self::ACCEPTED => 'emerald', // Verde fuerte
            self::ACCEPTED_WITH_OBJECTIONS => 'teal',
            self::REJECTED => 'red',
            self::ERROR => 'rose',
            self::RETRY => 'orange',
        };
    }
}
