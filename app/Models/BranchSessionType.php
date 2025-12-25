<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class BranchSessionType extends Pivot
{
    // Definimos explícitamente el nombre de la tabla
    protected $table = 'branch_session_type';

    // Indicamos que los IDs no son incrementales (si usas id autoincremental en la migración, pon true)
    public $incrementing = true;

    protected $fillable = [
        'branch_id',
        'session_type_id',
        'custom_price_clp',
        'custom_duration_minutes',
        'is_active_in_branch',
        'custom_code', // Si decidiste usarlo
    ];

    protected $casts = [
        'is_active_in_branch' => 'boolean',
        'custom_price_clp' => 'integer',
        'custom_duration_minutes' => 'integer',
    ];
}
