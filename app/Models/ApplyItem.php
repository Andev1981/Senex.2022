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
        'application_type_id',
        'application_type_user_id',
        'price',
        'status',
        'fecha_atencion',
        'numero_sesion',
        'comments'
    ];

    public function applicationType()
    {
        return $this->belongsTo(ApplicationType::class);
    }

    public function applicationTypeUser(){
        return $this->hasOne(ApplicationTypeUser::class,'id','application_type_user_id');
    }

    public function images(){
        return $this->morphMany(Image::class, 'imageable');
    }

    public function application(){
        return $this->belongsTo(Application::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function assign(){
        return $this->hasOne(Assign::class);
    }
}
