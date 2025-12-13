<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'rut',
        'busioness_name',
        'giro',
        'email',
        'phone',

    ];


    public function dteConfiguration()
    {
        // Se recomienda usar el nombre en singular para la función
        return $this->hasOne(DteConfiguration::class);
    }

}
