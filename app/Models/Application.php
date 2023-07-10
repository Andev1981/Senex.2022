<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'derivado',
        'desde',
        'application_type_id',
        'type_value',
        'type_payment',
        'price',
        'comments',
        'status'
    ];

    public function aplication_type()
    {
        return $this->hasOne(ApplicationType::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ApplyItem::class);
    }
}
