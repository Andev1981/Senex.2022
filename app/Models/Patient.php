<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'state',
        'direccion',
        'comuna',
        'phone',
        'p1',
        'p2',
        'p3',
        'p4',
        'p5'
        ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function solicitudes(){
        return $this->hasMany(Solicitud::class);
    }

}
