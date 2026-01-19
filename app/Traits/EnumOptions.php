<?php

namespace App\Traits;

trait EnumOptions
{
    public static function options(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'color' => $case->color(),
        ], static::cases());
    }

    public static function values(): array
    {
        return array_column(static::cases(), 'value');
    }

    public static function getLabel(string $value): string
    {
        return static::tryFrom($value)?->label() ?? $value;
    }

    public static function getColor(string $value): string
    {
        return static::tryFrom($value)?->color() ?? 'gray';
    }
}
