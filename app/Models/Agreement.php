<?php

// app/Models/Agreement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agreement extends Model
{
    protected $fillable = [
        'company_id',   // ID de la Clínica que posee este convenio (Multi-empresa)
        'insurance_id', // ID de la Aseguradora con la que se tiene el contrato (Ej: Colmena)
        'name',         // Nombre del contrato (Ej: Tarifario 2025 Kinesico)
        'version',      // Versión del documento de tarifas
        'is_active',    // Bandera para activar/desactivar el tarifario (debe ser único activo por insurance/company)
        'start_date',   // Fecha de inicio de vigencia del convenio
        'end_date',     // Fecha de fin de vigencia (opcional)
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relaciones:

    // Un Acuerdo pertenece a una Aseguradora
    public function insurance()
    {
        return $this->belongsTo(Insurance::class);
    }

    // Un Acuerdo pertenece a una Compañía
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Un Acuerdo tiene muchas reglas de precio (AgreementRule)
    public function items()
    {
        return $this->hasMany(AgreementRule::class);
    }
}
