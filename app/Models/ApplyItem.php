<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplyItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_id',
        'status',
        'fecha_atencion',
        'comments'
    ];

    public function images(){
        return $this->morphMany(Image::class, 'imageable');
    }

    public function application(){
        return $this->belongsTo(Application::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
