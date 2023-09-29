<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

     protected $fillable = [
        'user_id',
        'name',
        'last_name',
        'avatar',
        'rut',
        'birth',
        'phone',
        'address_id',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
