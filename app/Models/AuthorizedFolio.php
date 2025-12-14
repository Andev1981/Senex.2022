<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuthorizedFolio extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'company_id',
        'rut_emisor',
        'tipo_dte',
        'folio_desde',
        'folio_hasta',
        'ultimo_folio_usado',
        'caf_xml',
        'fecha_vencimiento',
        'activo',
    ];
}
