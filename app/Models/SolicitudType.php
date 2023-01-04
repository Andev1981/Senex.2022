<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SolicitudType extends Model
{
    use HasFactory;
    protected $guarded = [
        'id'
    ];


    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function solicitudes(){
        return $this->hasMany(Solicitud::class);
    }

    public function price()
    {
        return $this->hasOne(Price::class);
    }
}
