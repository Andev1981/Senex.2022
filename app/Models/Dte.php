<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dte extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'company_id',
        'branch_id',
        'origin_type',
        'origin_id',
        'type',
        'folio',
        'rut_emisor',
        'rut_receptor',
        'amount_total_clp',
        'estado_sii',
        'track_id',
        'glosa_rechazo',
        'xml_data',
        'related_dte_id',
    ];

    // Relación inversa: "Dime quién me generó"
    public function origin()
    {
        return $this->morphTo();
    }
}
