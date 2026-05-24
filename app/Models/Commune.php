<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commune extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'int';
    protected $fillable = ['id', 'region_id', 'code', 'name', 'lat', 'lng', 'bbox'];
    protected $casts = ['bbox' => 'array', 'lat' => 'decimal:7', 'lng' => 'decimal:7'];
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
