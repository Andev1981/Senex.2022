<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profesion',
        'firma',
        'state'
        ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function solicituds(){
        return $this->hasMany(Solicitud::class);
    }

    public function prices()
    {
        return $this->hasMany(Price::class);
    }

}
