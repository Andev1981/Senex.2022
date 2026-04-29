<?php

// app/Models/AgreementRule.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgreementRule extends Model
{
    protected $fillable = [
        'agreement_id',          // FK al contrato padre (Agreement)
        'item_id',               // FK al servicio/prestación al que aplica la regla
        'plan_id',               // FK al plan específico (Plan 300, Tramo B, etc.) - puede ser NULL para regla general

        'gross_price_clp',           // Precio Bruto total (Tarifa acordada con la aseguradora)
        'patient_share_clp',     // Copago que debe pagar el paciente (Aporte Paciente)
        'insurance_share_clp',   // Monto que paga la aseguradora (Aporte Aseguradora)

        'patient_percentage',    // Porcentaje de cobertura (redundante, pero útil para reportes)
        'insurance_percentage',  // Porcentaje de cobertura (redundante, pero útil para reportes)
    ];

    protected $casts = [
        'gross_price_clp' => 'integer',
        'patient_share_clp' => 'integer',
        'insurance_share_clp' => 'integer',
        'patient_percentage' => 'float',
        'insurance_percentage' => 'float',
    ];

    // Relaciones:

    // Un Item de Convenio pertenece a un Acuerdo
    public function agreement()
    {
        return $this->belongsTo(Agreement::class);
    }

    // Un Item de Convenio aplica a un tipo de Sesión/Servicio
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    // Un Item de Convenio puede aplicar a un Plan específico (para diferenciación de tarifas)
    public function plan()
    {
        // Esta relación es opcional (puede ser null) para reglas que aplican a toda la aseguradora sin importar el plan
        return $this->belongsTo(Plan::class);
    }
}
