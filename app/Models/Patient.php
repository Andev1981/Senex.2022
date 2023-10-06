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
        'payment_status',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
    public function address()
    {
        return $this->belongsTo(Address::class);
    }
    
    public function applyItems()
    {
        return $this->hasMany(ApplyItem::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
}
