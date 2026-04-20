<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum DteStatusEnum: string
{
    use EnumOptions;

    case PENDING = 'pending';           // Por emitir (Estado Inicial)
    case GENERATED = 'created';         // Creado localmente (Listo para firma)
    case SENT = 'sent';                 // Enviado al SII (Track ID recibido)
    case ACCEPTED = 'accepted';         // Aceptado por el SII (Final OK)
    case ACCEPTED_WITH_OBJECTIONS = 'accepted_with_objections';
    case REJECTED = 'rejected';         // Rechazado legalmente
    case ERROR = 'error';               // Error técnico
    case RETRY = 'pending_retry';       // En cola de reintento

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pendiente',
            self::GENERATED => 'Generado',
            self::SENT => 'Enviado SII',
            self::ACCEPTED => 'Aceptado',
            self::ACCEPTED_WITH_OBJECTIONS => 'Aceptado c/ Rep',
            self::REJECTED => 'Rechazado',
            self::ERROR => 'Error',
            self::RETRY => 'Reintentando...',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::GENERATED => 'blue',
            self::SENT => 'amber',
            self::ACCEPTED => 'emerald',
            self::ACCEPTED_WITH_OBJECTIONS => 'teal',
            self::REJECTED => 'red',
            self::ERROR => 'rose',
            self::RETRY => 'orange',
        };
    }
}
