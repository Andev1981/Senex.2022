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
        'price',
        'comments',
        'status',
    ];

    public function images(){
        return $this->morphMany(Image::class, 'imageable');
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function items(){
        return $this->hasMany(ApplyItem::class);
    }

}
