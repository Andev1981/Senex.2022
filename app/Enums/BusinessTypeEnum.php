<?php

namespace App\Enums;

use App\Traits\EnumOptions;

enum BusinessTypeEnum: string
{
    use EnumOptions;

    case CLINICAL = 'clinical';
    case SERVICE  = 'service';
    case RETAIL   = 'retail';

    public function label(): string {
        return match($this) {
            self::CLINICAL => 'Gestión Clínica / Salud',
            self::SERVICE  => 'Servicios / Desarrollo / Consultoría',
            self::RETAIL   => 'Venta de Productos / Retail',
        };
    }

    /**
     * Define qué módulos están habilitados para este tipo de negocio
     */
    public function modules(): array {
        return match($this) {
            self::CLINICAL => [
                'patients' => true,
                'medical_records' => true,
                'insurances' => true,
                'agreements' => true,
                'doctors' => true,
                'appointments' => true,
                'clinical_terminology' => true,
            ],
            self::SERVICE => [
                'patients' => true, // Se renombrará a 'Clientes' en UI
                'medical_records' => false,
                'insurances' => false,
                'agreements' => false,
                'doctors' => false,
                'appointments' => false,
                'projects' => true, // Futuro
                'clinical_terminology' => false,
            ],
            self::RETAIL => [
                'patients' => true,
                'inventory' => true,
                'medical_records' => false,
                'insurances' => false,
                'agreements' => false,
                'doctors' => false,
                'clinical_terminology' => false,
            ],
        };
    }

    /**
     * Término que debe usarse para referirse a los sujetos del negocio
     */
    public function subjectLabel(): string {
        return match($this) {
            self::CLINICAL => 'Paciente',
            self::SERVICE  => 'Cliente',
            self::RETAIL   => 'Cliente',
        };
    }
}
