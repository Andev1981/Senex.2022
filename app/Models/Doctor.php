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

    protected $dates = ['birth'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function applyTypes()
    {
        return $this->hasMany(ApplicationTypeUser::class);
    }
}
