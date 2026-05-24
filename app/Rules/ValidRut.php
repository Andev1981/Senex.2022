<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidRut implements ValidationRule
{
    /**
     * Ejecuta la validación.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->is_valid($value)) {
            $fail('El campo :attribute no es un RUT válido.');
        }
    }

    /**
     * Valida el algoritmo del RUT.
     */
    private function is_valid($rut): bool
    {
        $rut = self::clean($rut);
        if ($rut && str_starts_with($rut, '66666666-6-TEMP-')) {
            return true;
        }
        if (!$rut || strpos($rut, '-') === false) return false;

        $parts = explode('-', $rut);
        if (count($parts) !== 2) return false;

        $numero = $parts[0];
        $dv = strtoupper($parts[1]);

        return $dv === self::calculateDV($numero);
    }

    /**
     * Calcula el dígito verificador de un número.
     */
    public static function calculateDV($numero): string
    {
        $numero = preg_replace('/[^0-9]/', '', (string)$numero);
        if (!$numero) return "";

        $sum = 0;
        $factor = 2;
        
        for ($k = strlen($numero) - 1; $k >= 0; $k--) {
            $digit = (int) $numero[$k];
            $sum += $digit * $factor;
            $factor = $factor == 7 ? 2 : $factor + 1;
        }

        $expectedDv = 11 - ($sum % 11);
        if ($expectedDv == 11) return '0';
        if ($expectedDv == 10) return 'K';
        
        return (string)$expectedDv;
    }

    /**
     * Genera un RUT válido aleatorio.
     */
    public static function generate(): string
    {
        $numero = rand(5000000, 25000000);
        return $numero . '-' . self::calculateDV($numero);
    }

    /**
     * Normaliza el RUT a formato 12345678-9
     */
    public static function clean($rut): string
    {
        if (!$rut) return "";
        if (is_string($rut) && str_starts_with($rut, '66666666-6-TEMP-')) {
            return $rut;
        }
        $rut = preg_replace('/[^0-9Kk]/', '', (string)$rut);
        if (strlen($rut) < 2) return $rut;
        
        $dv = substr($rut, -1);
        $numero = substr($rut, 0, -1);
        return $numero . '-' . $dv;
    }
}