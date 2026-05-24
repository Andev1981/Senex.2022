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
        'street',
        'number',
        'commune_id',
        'region_id',
        'details',
        'country',
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

    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
