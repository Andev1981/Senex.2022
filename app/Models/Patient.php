<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
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

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
    
}
