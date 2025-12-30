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
        if (!$rut || strpos($rut, '-') === false) return false;

        $parts = explode('-', $rut);
        if (count($parts) !== 2) return false;

        $numero = $parts[0];
        $dv = strtoupper($parts[1]);

        if (!ctype_digit($numero)) return false;

        $sum = 0;
        $factor = 2;
        
        // Bucle reescrito para evitar errores de constante
        for ($k = strlen($numero) - 1; $k >= 0; $k--) {
            $digit = (int) $numero[$k];
            $sum += $digit * $factor;
            $factor = $factor == 7 ? 2 : $factor + 1;
        }

        $expectedDv = 11 - ($sum % 11);
        if ($expectedDv == 11) $expectedDv = '0';
        elseif ($expectedDv == 10) $expectedDv = 'K';
        else $expectedDv = (string)$expectedDv;

        return $dv === $expectedDv;
    }

    /**
     * Normaliza el RUT a formato 12345678-9
     */
    public static function clean($rut): string
    {
        if (!$rut) return "";
        $rut = preg_replace('/[^0-9Kk]/', '', (string)$rut);
        if (strlen($rut) < 2) return $rut;
        
        $dv = substr($rut, -1);
        $numero = substr($rut, 0, -1);
        return $numero . '-' . $dv;
    }
}