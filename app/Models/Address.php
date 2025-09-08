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
        'line1',
        'line2',
        'city',
        'region',
        'country',
        'postal_code',
        'lat',
        'lng',
        'notes',
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

    public function comuna()
    {
        return $this->belongsTo(Comuna::class);
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
