<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'int';
    protected $fillable = ['id', 'region_id', 'code', 'name'];
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
    public function communes()
    {
        return $this->hasMany(Commune::class);
    }
}
