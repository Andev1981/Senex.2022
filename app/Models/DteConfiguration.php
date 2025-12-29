<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DteConfiguration extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'company_id',
        'rut_empresa',
        'certificado_path',
        'certificado_password',
        'ambiente',
        'fecha_caducidad',
        'simulation_mode',
    ];

    protected $casts = [
        'simulation_mode' => 'boolean',
        'fecha_caducidad' => 'date',
    ];

    public function company() : BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
