<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'addressable_id',
        'addressable_type',
        'type',
        'is_primary',
        'lat',
        'lng',
        'line1',
        'line2',
        'city',
        'state',
        'commune_id',
        'region_id',
        'province_id',
        'postal_code',
        'country',
        'street',
        'number',
        'details',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
    ];

    public function addressable()
    {
        return $this->morphTo();
    }

    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }
    public function province()
    {
        return $this->commune?->province();
    } // acceso por relación
    public function region()
    {
        return $this->commune?->province?->region();
    }
}
