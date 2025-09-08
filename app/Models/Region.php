<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'int';
    protected $fillable = ['id', 'code', 'name', 'roman'];
    public function provinces()
    {
        return $this->hasMany(Province::class);
    }
}
