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
        'company_rut',
        'acteco',
        'signer_rut',
        'certificate_path',
        'certificate_password',
        'environment',
        'expiration_date',
        'simulation_mode',
    ];

    protected $casts = [
        'simulation_mode' => 'boolean',
        'expiration_date' => 'datetime',
    ];

    public function company() : BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
