<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DteConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'rut_empresa',
        'certificado_path',
        'certificado_password',
        'ambiente',
        'fecha_caducidad'
    ];

    public function company() : BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
